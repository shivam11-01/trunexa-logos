export interface LogoFile {
  svg?: string;
  png1x?: string;
  jpg?: string;
  pdf?: string;
}

export type ColorVariant = 'black' | 'white'

export interface Logo {
  id: string;
  name: string;
  variant: string;
  category: string;
  previewBg: "light" | "dark";
  // Static (legacy) file paths — used when Firestore not available
  files: LogoFile;
  // Firestore colorVariants (populated from Firestore)
  colorVariants?: {
    black?: LogoFile;
    white?: LogoFile;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logos: Logo[];
}

// --- Supabase-native types (flat structure) ---
export interface SupabaseLogo {
  id: string; // UUID
  brand_id: string;
  name: string;
  variant: string;
  color: string;
  file_type: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export interface SupabaseBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  order: number;
}

// Convert a group of Supabase flat rows into the legacy Logo shape if needed, 
// but for the new logic, the components will accept the flat rows directly or grouped.
export interface LogoGroup {
  id: string; // The ID of the first row, or a generated slug
  name: string;
  variant: string;
  previewBg: "light" | "dark";
  rows: SupabaseLogo[];
  legacyLogo?: Logo; // fallback for static
}

export function groupSupabaseLogos(flatLogos: SupabaseLogo[]): LogoGroup[] {
  const groups = new Map<string, LogoGroup>();

  for (const row of flatLogos) {
    const key = `${row.name}-${row.variant}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: row.id, // we use the first discovered row's ID 
        name: row.name,
        variant: row.variant,
        previewBg: "light",
        rows: [],
      });
    }
    groups.get(key)!.rows.push(row);
  }

  return Array.from(groups.values());
}

export function convertLegacyToGroup(logo: Logo): LogoGroup {
  return {
    id: logo.id,
    name: logo.name,
    variant: logo.variant,
    previewBg: logo.previewBg,
    rows: [],
    legacyLogo: logo,
  };
}



// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED BRAND CONFIG — edit here to change names, descriptions, categories.
// The `slug` must match what is stored in Supabase (used only to resolve the
// brand's DB id for logo fetching — display info is never read from the DB).
// ─────────────────────────────────────────────────────────────────────────────
export const BRANDS: Array<{
  slug: string;
  name: string;
  description: string;
  category: string;
  order: number;
}> = [
    {
      slug: "trunexa",
      name: "Trunexa",
      description: "Our own technology house",
      category: "Design House",
      order: 1,
    },
    {
      slug: "trucrux",
      name: "Trucrux",
      description: "High performance boards",
      category: "Technology",
      order: 2,
    },
    {
      slug: "chargnex",
      name: "Chargnex",
      description: "EV charging solutions",
      category: "EV Solutions",
      order: 3,
    },
    {
      slug: "flownex",
      name: "Flownex",
      description: "Payment ready transit solutions",
      category: "Transit Solutions",
      order: 4,
    },
    {
      slug: "paynex",
      name: "Paynex",
      description: "Payments and financial infrastructure",
      category: "Payments Solutions",
      order: 5,
    },
    {
      slug: "others",
      name: "Others",
      description: "Miscellaneous brand assets",
      category: "Miscellaneous",
      order: 6,
    },
  ];

// Legacy alias kept for backward compatibility with any remaining static refs
export const brands: Brand[] = [];
