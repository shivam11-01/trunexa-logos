"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoCard } from "@/components/LogoCard";
import { AddLogoButton } from "@/components/AddLogoButton";
import { PinModal } from "@/components/PinModal";
import { UploadLogoModal } from "@/components/UploadLogoModal";
import { getLogosByBrand } from "@/lib/db";
import {
  type Brand,
  type SupabaseBrand,
  type LogoGroup,
  groupSupabaseLogos,
  convertLegacyToGroup,
} from "@/lib/brands.config";

interface BrandSectionProps {
  brand: Brand;
  dbBrand?: SupabaseBrand;
  allDbBrands: SupabaseBrand[];
  onLogoClick: (logoGroup: LogoGroup, brand: Brand) => void;
}

export function BrandSection({
  brand,
  dbBrand,
  allDbBrands,
  onLogoClick,
}: BrandSectionProps) {
  const [dbLogos, setDbLogos] = useState<LogoGroup[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Fetch logos from Supabase when dbBrand is available
  useEffect(() => {
    if (!dbBrand?.id) return;
    setLoadingLogos(true);
    getLogosByBrand(dbBrand.id)
      .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
      .catch(() => setDbLogos([]))
      .finally(() => setLoadingLogos(false));
  }, [dbBrand?.id]);

  // Use DB logos if available, otherwise static
  const logoGroups: LogoGroup[] = dbBrand
    ? dbLogos
    : brand.logos.map(convertLegacyToGroup);

  const handleUploaded = () => {
    if (!dbBrand?.id) return;
    getLogosByBrand(dbBrand.id)
      .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
      .catch(() => {});
  };

  return (
    <section id={`brand-${brand.slug}`} className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "#0F172A" }}
          >
            {brand.name}
          </h2>
          <Badge
            variant="secondary"
            className="rounded-md px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "#EEF2FF",
              color: "#1876F4",
              border: "1px solid #C7D2FE",
            }}
          >
            {brand.category}
          </Badge>
          {/* Add Logo button pushed to right */}
          <AddLogoButton onClick={() => setPinOpen(true)} />
        </div>

        <p className="mb-10 max-w-2xl text-base" style={{ color: "#6B7280" }}>
          {brand.description}
        </p>

        {/* Logo Grid */}
        {loadingLogos ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: "#E5E7EB" }}>
                <Skeleton className="h-36 sm:h-44" />
                <div className="flex flex-col gap-2 border-t px-4 py-3" style={{ borderColor: "#E5E7EB" }}>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : logoGroups.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16"
            style={{ borderColor: "#E5E7EB" }}
          >
            <svg className="mb-3 h-10 w-10" style={{ color: "#E5E7EB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v12A2.25 2.25 0 004.5 20.25zM15.75 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#6B7280" }}>No logos yet</p>
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Click "+ Add Logo" to upload the first one</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {logoGroups.map((group) => (
              <LogoCard
                key={group.id}
                group={group}
                brandSlug={brand.slug}
                onClick={() => onLogoClick(group, brand)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PIN Modal */}
      <PinModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSuccess={() => setUploadOpen(true)}
      />

      {/* Upload Modal */}
      <UploadLogoModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        brands={allDbBrands}
        defaultBrandId={dbBrand?.id}
        onUploaded={handleUploaded}
      />
    </section>
  );
}

