"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { LogoGroup } from "@/lib/brands.config";

interface LogoCardProps {
  group: LogoGroup;
  brandSlug: string;
  onClick: () => void;
  onDelete?: () => void;
}

export function LogoCard({ group, brandSlug, onClick, onDelete }: LogoCardProps) {
  // Find a preview image. We prioritize any SVG, then any PNG, across all colors.
  let previewUrl = "";
  let hasSvg = false;
  
  if (group.rows.length > 0) {
    const svgRow = group.rows.find((r) => r.file_type === "SVG");
    const pngRow = group.rows.find((r) => r.file_type === "PNG" || r.file_type.startsWith("PNG"));
    hasSvg = !!svgRow;
    previewUrl = svgRow?.public_url || pngRow?.public_url || "";
  } else if (group.legacyLogo) {
    // fallback for legacy
    const files = group.legacyLogo.files;
    hasSvg = !!files.svg;
    previewUrl = files.svg || files.png1x || "";
  }

  const formatLabel = hasSvg ? "SVG" : (group.rows.some(r => r.file_type === "PNG") ? "PNG" : "JPG");

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/brands/${brandSlug}?logo=${group.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1876F4] focus-visible:ring-offset-2 cursor-pointer"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderRadius: 12,
      }}
      id={`logo-card-${group.id}`}
    >
      {/* Action buttons — visible on hover */}
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {/* Share button */}
        <Tooltip>
          <TooltipTrigger
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            style={{ border: "1px solid #E5E7EB" }}
            onClick={handleShare}
            aria-label="Copy link"
            id={`share-btn-${group.id}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Copy link</p>
          </TooltipContent>
        </Tooltip>

        {/* Delete button — only shown when onDelete is provided */}
        {onDelete && (
          <Tooltip>
            <TooltipTrigger
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50"
              style={{ border: "1px solid #E5E7EB" }}
              onClick={handleDelete}
              aria-label="Delete logo"
              id={`delete-btn-${group.id}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Delete logo</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Preview area */}
      <div
        className="relative flex h-48 items-center justify-center p-8 sm:h-56"
        style={{
          backgroundColor: group.previewBg === "dark" ? "#1E293B" : "#F8F9FB",
        }}
      >
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={`${group.name} - ${group.variant}`}
            width={200}
            height={100}
            className="max-h-24 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:max-h-28"
            unoptimized
          />
        )}
      </div>

      {/* Info */}
      <div
        className="flex flex-1 flex-col gap-1 border-t px-4 py-3.5"
        style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
      >
        <span
          className="text-sm font-semibold leading-tight"
          style={{ color: "#0F172A" }}
        >
          {group.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
            {group.variant}
          </span>
          <Badge
            variant="outline"
            className="h-5 rounded px-1.5 text-[9px] font-bold uppercase tracking-tight"
            style={{
              color: "#1876F4",
              borderColor: "#C7D2FE",
              backgroundColor: "#EEF2FF",
            }}
          >
            {formatLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
}

