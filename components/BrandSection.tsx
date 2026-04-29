"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoCard } from "@/components/LogoCard";
import { AddLogoButton } from "@/components/AddLogoButton";
import { PinModal } from "@/components/PinModal";
import { UploadLogoModal } from "@/components/UploadLogoModal";
import { getLogosByBrand } from "@/lib/db";
import { toast } from "sonner";
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
  const [deletePinOpen, setDeletePinOpen] = useState(false);
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<LogoGroup | null>(null);

  // Fetch logos from Supabase when dbBrand is available
  useEffect(() => {
    if (!dbBrand?.id) return;
    setLoadingLogos(true);
    getLogosByBrand(dbBrand.id)
      .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
      .catch(() => setDbLogos([]))
      .finally(() => setLoadingLogos(false));
  }, [dbBrand?.id]);

  // Re-fetch whenever any upload completes
  useEffect(() => {
    const handler = () => refreshLogos();
    window.addEventListener("logos-updated", handler);
    return () => window.removeEventListener("logos-updated", handler);
  }, [dbBrand?.id]);

  // Use DB logos if available, otherwise static
  const logoGroups: LogoGroup[] = dbBrand
    ? dbLogos
    : brand.logos.map(convertLegacyToGroup);

  const refreshLogos = () => {
    if (!dbBrand?.id) return;
    getLogosByBrand(dbBrand.id)
      .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
      .catch(() => { });
  };

  const handleUploaded = () => refreshLogos();

  const handleDeleteRequest = (group: LogoGroup) => {
    setPendingDeleteGroup(group);
    setDeletePinOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!pendingDeleteGroup || !dbBrand?.id) return;

    try {
      const res = await fetch("/api/delete-logo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoName: pendingDeleteGroup.name,
          brandId: dbBrand.id,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(`Delete failed: ${json.error ?? "Please try again."}`);
      } else {
        toast.success(`"${pendingDeleteGroup.name}" has been deleted.`);
        // Immediately remove the card from local state (optimistic update)
        const deletedName = pendingDeleteGroup.name;
        setDbLogos((prev) => prev.filter((g) => g.name !== deletedName));
      }
    } catch {
      toast.error("Delete failed. Please try again.");
    } finally {
      setPendingDeleteGroup(null);
    }
  };

  return (
    <section id={`brand-${brand.slug}`} className="scroll-mt-20">
      <div>
        {/* Header row */}
        <div className="mb-[10px] flex flex-wrap items-center gap-3">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "#0F172A" }}
          >
            {brand.name}
          </h2>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: "#EEF2FF",
              color: "#1876F4",
              border: "1px solid #C7D2FE",
            }}
          >
            {brand.category}
          </Badge>
        </div>

        <p className="mb-6 max-w-2xl text-sm" style={{ color: "#6B7280" }}>
          {brand.description}
        </p>

        {/* Logo Grid */}
        {loadingLogos ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: "#E5E7EB" }}>
                <Skeleton className="h-48 sm:h-56" />
                <div className="flex flex-col gap-2 border-t px-4 py-3" style={{ borderColor: "#E5E7EB" }}>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : logoGroups.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 px-4 text-center transition-colors hover:bg-[#F9FAFB]"
            style={{ borderColor: "#E5E7EB" }}
          >
            <svg className="mb-4 h-12 w-12" style={{ color: "#D1D5DB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v12A2.25 2.25 0 004.5 20.25zM15.75 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <p className="text-base font-medium" style={{ color: "#6B7280" }}>No logos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {logoGroups.map((group) => (
              <LogoCard
                key={group.id}
                group={group}
                brandSlug={brand.slug}
                onClick={() => onLogoClick(group, brand)}
                onDelete={dbBrand ? () => handleDeleteRequest(group) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete PIN Modal */}
      <PinModal
        open={deletePinOpen}
        onOpenChange={(v) => {
          setDeletePinOpen(v);
          if (!v) setPendingDeleteGroup(null);
        }}
        onSuccess={() => {
          setDeletePinOpen(false);
          handleDeleteConfirmed();
        }}
        title="Confirm Delete"
        description={`Enter your admin PIN to delete "${pendingDeleteGroup?.name ?? "this logo"}"`}
      />

      {/* Upload PIN Modal */}
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
