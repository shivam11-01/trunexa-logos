"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoCard } from "@/components/LogoCard";
import { getLogosByBrand } from "@/lib/db";
import {
  type Brand,
  type SupabaseBrand,
  type LogoGroup,
  groupSupabaseLogos,
} from "@/lib/brands.config";

interface BrandCardProps {
  brand: SupabaseBrand;
  onLogoClick: (logoGroup: LogoGroup, brand: Brand) => void;
}

export function BrandCard({ brand, onLogoClick }: BrandCardProps) {
  const [dbLogos, setDbLogos] = useState<LogoGroup[]>([]);
  const [loadingLogos, setLoadingLogos] = useState(false);

  useEffect(() => {
    if (!brand.id) return;
    setLoadingLogos(true);
    getLogosByBrand(brand.id)
      .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
      .catch(() => setDbLogos([]))
      .finally(() => setLoadingLogos(false));
  }, [brand.id]);

  // Re-fetch whenever any upload completes
  useEffect(() => {
    if (!brand.id) return;
    const handler = () => {
      getLogosByBrand(brand.id)
        .then((rows) => setDbLogos(groupSupabaseLogos(rows)))
        .catch(() => {});
    };
    window.addEventListener("logos-updated", handler);
    return () => window.removeEventListener("logos-updated", handler);
  }, [brand.id]);

  const brandObj: Brand = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    category: brand.category,
    logos: [],
  };

  return (
    <div className="flex flex-col h-full group/brand">
      {/* Brand Header */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-center gap-2.5 flex-wrap">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
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
        <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
          {brand.description}
        </p>
      </div>

      {/* Logo Grid (Single column in this layout usually) */}
      <div className="flex-1">
        {loadingLogos ? (
          <div className="space-y-4">
            <div className="flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: "#E5E7EB" }}>
              <Skeleton className="h-32" />
              <div className="flex flex-col gap-2 border-t px-3 py-2" style={{ borderColor: "#E5E7EB" }}>
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-2 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ) : dbLogos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 px-4 text-center transition-colors hover:bg-[#F9FAFB]"
            style={{ borderColor: "#E5E7EB" }}
          >
            <svg className="mb-3 h-10 w-10" style={{ color: "#D1D5DB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 20.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6v12A2.25 2.25 0 004.5 20.25zM15.75 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#6B7280" }}>No logos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {dbLogos.map((group) => (
              <LogoCard
                key={group.id}
                group={group}
                brandSlug={brand.slug}
                onClick={() => onLogoClick(group, brandObj)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
