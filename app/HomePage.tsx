"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BrandSection } from "@/components/BrandSection";
import { LogoModal } from "@/components/LogoModal";
import { Separator } from "@/components/ui/separator";
import { brands as staticBrands, type LogoGroup, type Brand, type SupabaseBrand } from "@/lib/brands.config";
import { getBrands } from "@/lib/db";

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function HomePageInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedGroup, setSelectedGroup] = useState<LogoGroup | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dbBrands, setDbBrands] = useState<SupabaseBrand[]>([]);
  const [dbReady, setDbReady] = useState(false);

  // Try to fetch brands from Supabase (if configured)
  useEffect(() => {
    const hasConfig = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!hasConfig) return;
    getBrands()
      .then((fb) => { setDbBrands(fb); setDbReady(true); })
      .catch(() => setDbReady(false));
  }, []);

  // Deep-link: auto-open modal if ?logo= is present
  useEffect(() => {
    const logoId = searchParams.get("logo");
    if (!logoId) return;
    // Look up through static brands first, dynamic routing could be added later
    for (const brand of staticBrands) {
      const legacyLogo = brand.logos.find((l) => l.id === logoId);
      if (legacyLogo) {
        setSelectedGroup({
          id: legacyLogo.id,
          name: legacyLogo.name,
          variant: legacyLogo.variant,
          previewBg: legacyLogo.previewBg,
          rows: [],
          legacyLogo,
        });
        setSelectedBrand(brand);
        setModalOpen(true);
        break;
      }
    }
  }, [searchParams, pathname]);

  const handleLogoClick = useCallback((group: LogoGroup, brand: Brand) => {
    setSelectedGroup(group);
    setSelectedBrand(brand);
    setModalOpen(true);
  }, []);

  // Match each static brand with its Supabase counterpart (by slug)
  const getDbBrand = (slug: string): SupabaseBrand | undefined =>
    dbBrands.find((fb) => fb.slug === slug);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Brand Sections */}
        {dbBrands.map((brand, i) => (
          <div key={brand.id}>
            <BrandSection
              brand={{
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                description: brand.description,
                category: brand.category,
                logos: [], // Logos will be fetched by BrandSection itself
              }}
              dbBrand={brand}
              allDbBrands={dbBrands}
              onLogoClick={handleLogoClick}
            />
            {i < dbBrands.length - 1 && (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Separator style={{ backgroundColor: "#E5E7EB" }} />
              </div>
            )}
          </div>
        ))}

      </main>

      <LogoModal
        group={selectedGroup}
        brand={selectedBrand}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

export function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}

function GuidelineCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold" style={{ color: "#0F172A" }}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function CheckCircle() {
  return (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircle() {
  return (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InfoCircle() {
  return (
    <svg className="h-5 w-5" style={{ color: "#1876F4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
