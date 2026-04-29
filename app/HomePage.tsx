"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BrandSection } from "@/components/BrandSection";
import { BrandCard } from "@/components/BrandCard";
import { LogoModal } from "@/components/LogoModal";
import { Separator } from "@/components/ui/separator";
import { BRANDS, type LogoGroup, type Brand, type SupabaseBrand } from "@/lib/brands.config";
import { getBrands } from "@/lib/db";

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function HomePageInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [selectedGroup, setSelectedGroup] = useState<LogoGroup | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // dbBrands is only used to resolve slug → DB id for logo fetching.
  // Names, descriptions, categories come from the hardcoded BRANDS config.
  const [dbBrands, setDbBrands] = useState<SupabaseBrand[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    getBrands().then(setDbBrands).catch(() => {});
  }, []);

  // Resolve a brand slug to its Supabase id (needed for logo fetching only)
  const getDbBrand = (slug: string): SupabaseBrand | undefined =>
    dbBrands.find((b) => b.slug === slug);

  const handleLogoClick = useCallback((group: LogoGroup, brand: Brand) => {
    setSelectedGroup(group);
    setSelectedBrand(brand);
    setModalOpen(true);
  }, []);

  // First 5 brands go in the top grid, remainder go in full-width sections
  const topBrands = BRANDS.slice(0, 5);
  const bottomBrands = BRANDS.slice(5);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <HeroSection brandCount={BRANDS.length} />

          {/* Main Brands Grid — top 5 */}
          <div className="py-16">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {topBrands.map((b) => {
                const dbBrand = getDbBrand(b.slug);
                return (
                  <BrandCard
                    key={b.slug}
                    brand={{
                      // Merge hardcoded display info with DB id
                      id: dbBrand?.id ?? b.slug,
                      name: b.name,
                      slug: b.slug,
                      description: b.description,
                      category: b.category,
                      order: b.order,
                    }}
                    onLogoClick={handleLogoClick}
                  />
                );
              })}
            </div>
          </div>

          {/* Remaining Brands (Full Width) */}
          {bottomBrands.length > 0 && (
            <div className="flex flex-col gap-20 pb-20">
              {bottomBrands.map((b) => {
                const dbBrand = getDbBrand(b.slug);
                return (
                  <div key={b.slug} className="pt-10 border-t" style={{ borderColor: "#F1F5F9" }}>
                    <BrandSection
                      brand={{
                        id: dbBrand?.id ?? b.slug,
                        name: b.name,
                        slug: b.slug,
                        description: b.description,
                        category: b.category,
                        logos: [],
                      }}
                      dbBrand={dbBrand}
                      allDbBrands={dbBrands}
                      onLogoClick={handleLogoClick}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
