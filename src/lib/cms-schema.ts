/**
 * Shopify-style section schema registry.
 *
 * Each entry describes a section type that the public site knows how
 * to render. The admin UI auto-generates an editor from these
 * definitions, so adding a new section type is just:
 *
 *   1. Add an entry here
 *   2. Render it in src/app/page.tsx (or wherever the page is rendered)
 *
 * The DB stays schema-flexible — settings are JSONB.
 */

// ─── Field types the admin editor knows how to render ─────────────

export type FieldType =
  | "text"
  | "long_text"
  | "image_url"
  | "url"
  | "color"
  | "boolean"
  | "number";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  default?: string | number | boolean | null;
  help?: string;
  placeholder?: string;
};

export type BlockDef = {
  type: string;
  label: string;
  description?: string;
  /** Maximum number of blocks of this type per section (defaults to 50). */
  max?: number;
  settings: FieldDef[];
};

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  /**
   * Singular sections (like the hero) can only appear once per page.
   * Default: false (multiple instances allowed).
   */
  singular?: boolean;
  settings: FieldDef[];
  blocks?: BlockDef[];
};

// ─── Section registry ──────────────────────────────────────────────

export const sectionDefs: SectionDef[] = [
  {
    type: "hero",
    label: "Hero banner",
    description:
      "Top of the home page — background image, headline, subtitle, optional live booking ticker.",
    singular: true,
    settings: [
      {
        key: "image_url",
        label: "Background image URL",
        type: "image_url",
        placeholder: "https://images.unsplash.com/photo-...",
        help: "Wide image (1920×1080+). Will be dimmed and gradient-overlaid for legibility.",
      },
      {
        key: "eyebrow",
        label: "Eyebrow tagline",
        type: "text",
        placeholder: "Trusted by 2M+ travellers across India",
        help: "Small pill above the headline. Leave blank to hide.",
      },
      {
        key: "title_line1",
        label: "Title line 1",
        type: "text",
        placeholder: "Travel in Comfort,",
      },
      {
        key: "title_line2",
        label: "Title line 2 (gold gradient)",
        type: "text",
        placeholder: "Arrive in Style",
      },
      {
        key: "subtitle",
        label: "Subtitle",
        type: "long_text",
        placeholder: "Premium intercity bus travel across India…",
      },
      {
        key: "show_ticker",
        label: "Show live booking ticker",
        type: "boolean",
        default: true,
      },
    ],
  },

  {
    type: "offers",
    label: "Offers carousel",
    description:
      "Promotional cards below the hero. Add as many cards as you like.",
    settings: [
      {
        key: "heading",
        label: "Section heading",
        type: "text",
        default: "Today's offers",
      },
      {
        key: "subtitle",
        label: "Section subtitle",
        type: "text",
        default: "Limited-time deals across our most-loved routes.",
      },
    ],
    blocks: [
      {
        type: "offer-card",
        label: "Offer card",
        description: "A single promotional tile with image, badge, and CTA.",
        max: 12,
        settings: [
          { key: "title",        label: "Title",         type: "text" },
          { key: "description",  label: "Description",   type: "long_text" },
          { key: "image_url",    label: "Image URL",     type: "image_url" },
          { key: "badge",        label: "Badge",         type: "text", placeholder: "Limited time" },
          { key: "accent_color", label: "Accent colour", type: "color", default: "#1a3a8f" },
          { key: "cta_label",    label: "Button label",  type: "text", default: "Book now" },
          { key: "cta_url",      label: "Button URL",    type: "url", placeholder: "/search?from=…" },
        ],
      },
    ],
  },
];

export function findSectionDef(type: string): SectionDef | undefined {
  return sectionDefs.find((s) => s.type === type);
}

export function findBlockDef(sectionType: string, blockType: string): BlockDef | undefined {
  return findSectionDef(sectionType)?.blocks?.find((b) => b.type === blockType);
}

/**
 * Returns a blank settings object for a section/block, populated with
 * the default values from the schema.
 */
export function defaultSettings(fields: FieldDef[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.default !== undefined) out[f.key] = f.default;
    else if (f.type === "boolean") out[f.key] = false;
  }
  return out;
}
