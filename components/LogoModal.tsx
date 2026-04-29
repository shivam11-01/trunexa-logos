"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormatSelect, type FormatOption } from "@/components/FormatSelect";
import { downloadFile } from "@/lib/download";
import { copySvgToClipboard, copyPngToClipboard } from "@/lib/copy";
import { toast } from "sonner";
import type { LogoGroup, Brand, ColorVariant, LogoFile } from "@/lib/brands.config";

interface LogoModalProps {
  group: LogoGroup | null;
  brand: Brand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorVariantLabels: Record<ColorVariant, string> = {
  black: "Black",
  white: "White",
};

export function LogoModal({ group, brand, open, onOpenChange }: LogoModalProps) {
  const [previewBg, setPreviewBg] = useState<"light" | "dark">("light");
  const [format, setFormat] = useState<FormatOption>("svg");
  const [colorVariant, setColorVariant] = useState<ColorVariant>("black");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Filter available formats for the selected color variant
  let availableFormats: FormatOption[] = [];
  let currentFileUrl = "";
  let previewSrc = "";

  if (group && group.rows.length > 0) {
    const colorRows = group.rows.filter((r) => r.color === colorVariant);
    
    // Use a Set to avoid duplicates
    const formatsSet = new Set<FormatOption>();
    if (colorRows.some((r) => r.file_type === "SVG")) formatsSet.add("svg");
    if (colorRows.some((r) => r.file_type === "PNG")) {
      formatsSet.add("png");
    }
    if (colorRows.some((r) => r.file_type === "JPG")) formatsSet.add("jpg");
    if (colorRows.some((r) => r.file_type === "PDF")) formatsSet.add("pdf");

    availableFormats = Array.from(formatsSet);
    
    // Attempt mapping format to DB file type
    const fileTypeMap: Record<FormatOption, string[]> = {
      svg: ["SVG"],
      png: ["PNG"],
      jpg: ["JPG"],
      pdf: ["PDF"],
    };

    const types = fileTypeMap[format];
    const match = colorRows.find(r => types.includes(r.file_type));
    currentFileUrl = match?.public_url || "";
    
    // For preview, prefer SVG or PNG from the selected color
    const svgMatch = colorRows.find(r => r.file_type === "SVG");
    const pngMatch = colorRows.find(r => r.file_type === "PNG");
    previewSrc = svgMatch?.public_url || pngMatch?.public_url || "";
  } else if (group && group.legacyLogo) {
    const fileSet = group.legacyLogo.colorVariants?.[colorVariant] ?? group.legacyLogo.files ?? {};
    
    if (fileSet.svg) availableFormats.push("svg");
    if (fileSet.png1x) availableFormats.push("png");
    if (fileSet.pdf) availableFormats.push("pdf");

    if (availableFormats.length === 0) {
      const legacyFiles = group.legacyLogo.files ?? {};
      if (legacyFiles.svg) availableFormats.push("svg");
      if (legacyFiles.png1x) availableFormats.push("png");
      if (legacyFiles.pdf) availableFormats.push("pdf");
    }

    const legacyFiles = group.legacyLogo.files ?? {};
    const formatToLegacyKey: Record<FormatOption, keyof LogoFile> = {
      svg: "svg",
      png: "png1x",
      jpg: "jpg",
      pdf: "pdf",
    };
    const legacyKey = formatToLegacyKey[format];
    currentFileUrl = fileSet[legacyKey] ?? legacyFiles[legacyKey] ?? "";
    previewSrc = fileSet.svg ?? fileSet.png1x ?? legacyFiles.svg ?? legacyFiles.png1x ?? "";
  }

  // Auto-adjust selected format if not available
  if (availableFormats.length > 0 && !availableFormats.includes(format)) {
    setFormat(availableFormats[0]);
  }

  const formatExtensions: Record<FormatOption, string> = {
    svg: ".svg",
    png: ".png",
    jpg: ".jpg",
    pdf: ".pdf",
  };

  const handleDownload = useCallback(async () => {
    if (!currentFileUrl || !group || !brand) return;
    setIsDownloading(true);
    try {
      const variantSuffix = `-${colorVariant}`;
      const fileName = `${brand.slug}-${group.variant.toLowerCase().replace(/\s+/g, "-")}${variantSuffix}${formatExtensions[format]}`;
      await downloadFile(currentFileUrl, fileName);
      toast.success("Download started");
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [currentFileUrl, brand?.slug, group?.variant, format, colorVariant, formatExtensions]);

  const handleCopy = useCallback(async () => {
    if (!currentFileUrl) return;
    setIsCopying(true);
    try {
      if (format === "svg") {
        await copySvgToClipboard(currentFileUrl);
      } else if (format.startsWith("png") || format === "jpg") {
        await copyPngToClipboard(currentFileUrl);
      } else {
        toast.error("Copy is only available for SVG, PNG, and JPG formats.");
        setIsCopying(false);
        return;
      }
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed. Please try again.");
    } finally {
      setIsCopying(false);
    }
  }, [currentFileUrl, format]);

  if (!group || !brand) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-2xl p-0"
        style={{ borderRadius: 16 }}
      >
        <DialogHeader className="border-b px-6 py-4" style={{ borderColor: "#E5E7EB" }}>
          <DialogTitle
            className="text-lg font-semibold"
            style={{ color: "#0F172A" }}
          >
            {group.name} — {group.variant}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 pt-4">
          {/* Preview */}
          <div
            className="flex items-center justify-center rounded-xl p-8 transition-colors duration-200"
            style={{
              backgroundColor: previewBg === "dark" ? "#1E293B" : "#F8F9FB",
              minHeight: 200,
              borderRadius: 12,
            }}
          >
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt={`${group.name} preview`}
                width={240}
                height={120}
                className="max-h-24 w-auto object-contain"
                unoptimized
              />
            ) : (
              <span className="text-sm" style={{ color: "#6B7280" }}>No preview available</span>
            )}
          </div>

          {/* Background Toggle */}
          <div className="flex items-center justify-center gap-1 rounded-lg p-1" style={{ backgroundColor: "#F8F9FB" }}>
            <button
              onClick={() => setPreviewBg("light")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                previewBg === "light" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              style={previewBg === "light" ? { color: "#0F172A" } : {}}
            >
              Light
            </button>
            <button
              onClick={() => setPreviewBg("dark")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                previewBg === "dark" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              style={previewBg === "dark" ? { color: "#0F172A" } : {}}
            >
              Dark
            </button>
          </div>

          {/* Variant + Format dropdowns side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6B7280" }}>
                Variant
              </label>
              <Select value={colorVariant} onValueChange={(v) => setColorVariant(v as ColorVariant)}>
                <SelectTrigger
                  className="w-full rounded-lg"
                  style={{ borderColor: "#E5E7EB", borderRadius: 8 }}
                  id="color-variant-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["black", "white"] as ColorVariant[]).map((v) => (
                    <SelectItem key={v} value={v}>
                      {colorVariantLabels[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6B7280" }}>
                Format
              </label>
              <FormatSelect
                value={format}
                onChange={setFormat}
                availableFormats={availableFormats.length > 0 ? availableFormats : ["svg"]}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleDownload}
              disabled={!currentFileUrl || isDownloading}
              className="h-11 w-full font-medium"
              style={{ backgroundColor: "#1876F4", borderRadius: 8 }}
              id="download-button"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? "Downloading…" : "Download"}
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!currentFileUrl || isCopying || format === "pdf"}
              variant="outline"
              className="h-11 w-full font-medium"
              style={{ borderRadius: 8, borderColor: "#E5E7EB" }}
              id="copy-button"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {isCopying ? "Copying…" : "Copy to Clipboard"}
            </Button>
          </div>

          {/* Usage note */}
          <p className="text-center text-xs" style={{ color: "#6B7280" }}>
            For digital use, prefer SVG. For print, use PDF.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
