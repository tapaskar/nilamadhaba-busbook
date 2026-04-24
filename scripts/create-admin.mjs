#!/usr/bin/env node
/**
 * Create (or update) an admin user in the Neon database.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-admin.mjs <email> <password> ["Full Name"]
 *
 * Examples:
 *   node --env-file=.env.local scripts/create-admin.mjs admin@nilamadhaba.com SuperSecret!123 "Admin User"
 *
 * If the email already exists, the password and name are updated and the
 * account is reactivated. Idempotent — safe to re-run.
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    "✗ DATABASE_URL is not set.\n" +
      "  Run:  vercel env pull .env.local\n" +
      "  Then: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [name]",
  );
  process.exit(1);
}

const [, , email, password, fullName] = process.argv;

if (!email || !password) {
  console.error(
    "✗ Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> [\"Full Name\"]",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("✗ Password must be at least 8 characters.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  const host = DATABASE_URL.match(/@([^/?]+)/)?.[1] ?? "(neon)";
  console.log(`→ Database: ${host}`);
  console.log(`→ Email:    ${email}`);
  console.log(`→ Name:     ${fullName ?? "(none)"}`);

  process.stdout.write("→ Hashing password… ");
  const hash = await bcrypt.hash(password, 10);
  console.log("✓");

  process.stdout.write("→ Upserting admin row… ");
  const rows = await sql`
    INSERT INTO admin_users (email, password_hash, full_name, is_active)
    VALUES (${email.toLowerCase()}, ${hash}, ${fullName ?? null}, true)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = excluded.password_hash,
          full_name     = COALESCE(excluded.full_name, admin_users.full_name),
          is_active     = true
    RETURNING id, email, full_name, created_at, last_login_at
  `;
  console.log("✓");

  console.log("\n✓ Admin user ready:");
  console.table(rows);
  console.log("\nSign in at: https://busbook-seven.vercel.app/admin/login");
}

main().catch((e) => {
  console.error("\n✗ Failed:", e.message ?? e);
  process.exit(1);
});
