#!/usr/bin/env node
/**
 * Apply db/migrations/*.sql to a Neon Postgres database.
 *
 * Why this script exists:
 *   Neon's HTTP driver (and the SQL Editor's prepared-statement path)
 *   errors with "cannot insert multiple commands into a prepared statement"
 *   when you paste a multi-statement migration. This runner splits the
 *   file into individual statements — respecting $$ dollar-quotes and
 *   line/block comments — and executes them one at a time.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate.mjs
 *
 * Env:
 *   DATABASE_URL  (pooled or unpooled Neon connection string)
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set.");
  console.error(
    "  Run:  vercel env pull .env.local",
  );
  console.error(
    "  Then: node --env-file=.env.local scripts/migrate.mjs",
  );
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, "../db/migrations");

/**
 * Split a multi-statement SQL string into individual statements.
 * Honours:
 *   - single-line  -- comments
 *   - block        /* … *\/ comments
 *   - 'single'     string literals (with '' escape)
 *   - "ident"      quoted identifiers (with "" escape)
 *   - $$…$$ and $tag$…$tag$ dollar-quoted strings
 *
 * A statement ends at the first top-level `;` outside all of the above.
 */
function splitStatements(sql) {
  const out = [];
  let buf = "";
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const ch = sql[i];
    const next = sql[i + 1];

    // line comment
    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      const end = nl === -1 ? len : nl;
      buf += sql.slice(i, end);
      i = end;
      continue;
    }
    // block comment
    if (ch === "/" && next === "*") {
      const close = sql.indexOf("*/", i + 2);
      const end = close === -1 ? len : close + 2;
      buf += sql.slice(i, end);
      i = end;
      continue;
    }
    // single-quoted string
    if (ch === "'") {
      buf += ch;
      i++;
      while (i < len) {
        if (sql[i] === "'" && sql[i + 1] === "'") {
          buf += "''";
          i += 2;
          continue;
        }
        if (sql[i] === "'") {
          buf += "'";
          i++;
          break;
        }
        buf += sql[i];
        i++;
      }
      continue;
    }
    // double-quoted identifier
    if (ch === '"') {
      buf += ch;
      i++;
      while (i < len) {
        if (sql[i] === '"' && sql[i + 1] === '"') {
          buf += '""';
          i += 2;
          continue;
        }
        if (sql[i] === '"') {
          buf += '"';
          i++;
          break;
        }
        buf += sql[i];
        i++;
      }
      continue;
    }
    // dollar-quoted string — $tag$...$tag$ (tag may be empty)
    if (ch === "$") {
      const m = sql.slice(i).match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
      if (m) {
        const tag = m[0]; // e.g. "$$" or "$tag$"
        buf += tag;
        i += tag.length;
        const close = sql.indexOf(tag, i);
        if (close === -1) {
          // unterminated — grab rest and bail
          buf += sql.slice(i);
          i = len;
          continue;
        }
        buf += sql.slice(i, close + tag.length);
        i = close + tag.length;
        continue;
      }
    }
    // statement terminator
    if (ch === ";") {
      const stmt = buf.trim();
      if (stmt.length > 0) out.push(stmt);
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const tail = buf.trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

function firstLine(stmt) {
  const line = stmt.split(/\n/).find((l) => l.trim() && !l.trim().startsWith("--"));
  return (line || stmt).trim().slice(0, 64);
}

async function applyFile(sql, filename) {
  const statements = splitStatements(sql);
  console.log(`→ ${filename}  (${statements.length} statements)`);

  const runner = neon(DATABASE_URL);
  let applied = 0;
  let skipped = 0;

  for (let idx = 0; idx < statements.length; idx++) {
    const stmt = statements[idx];
    const summary = firstLine(stmt);
    try {
      await runner.query(stmt);
      applied++;
      process.stdout.write(`  ✓ [${idx + 1}/${statements.length}] ${summary}\n`);
    } catch (e) {
      const msg = e.message || String(e);
      // Tolerate idempotent redeclarations (CREATE OR REPLACE, IF NOT EXISTS)
      if (
        /already exists/i.test(msg) ||
        /does not exist, skipping/i.test(msg)
      ) {
        skipped++;
        process.stdout.write(
          `  ~ [${idx + 1}/${statements.length}] ${summary}  (skip: ${msg.slice(0, 60)})\n`,
        );
        continue;
      }
      console.error(
        `\n✗ Statement ${idx + 1}/${statements.length} failed: ${summary}`,
      );
      console.error(`  SQL: ${stmt.slice(0, 200)}${stmt.length > 200 ? "…" : ""}`);
      console.error(`  Error: ${msg}`);
      throw e;
    }
  }

  return { applied, skipped };
}

async function main() {
  const host = DATABASE_URL.match(/@([^/?]+)/)?.[1] || "(neon)";
  console.log(`→ Applying migrations to ${host}\n`);

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("(no .sql files in db/migrations/)");
    return;
  }

  let totalApplied = 0;
  let totalSkipped = 0;

  for (const f of files) {
    const sql = readFileSync(path.join(migrationsDir, f), "utf8");
    const { applied, skipped } = await applyFile(sql, f);
    totalApplied += applied;
    totalSkipped += skipped;
  }

  console.log(
    `\n✓ Done.  applied=${totalApplied}  skipped=${totalSkipped}  files=${files.length}`,
  );
}

main().catch((e) => {
  console.error(`\n✗ Migration failed:`, e.message || e);
  process.exit(1);
});
