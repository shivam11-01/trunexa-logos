export interface LogoFile {
  svg?: string;
  png1x?: string;
  png2x?: string;
  png4x?: string;
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



export const brands: Brand[] = [];

