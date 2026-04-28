"use client";

import { useState, useRef, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import { uploadLogo } from "@/lib/storage";
import { addLogo } from "@/lib/db";
import { toast } from "sonner";
import type { SupabaseBrand } from "@/lib/brands.config";

interface UploadLogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands: SupabaseBrand[];
  defaultBrandId?: string;
  onUploaded?: () => void;
}

export function UploadLogoModal({
  open,
  onOpenChange,
  brands,
  defaultBrandId,
  onUploaded,
}: UploadLogoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [logoVariant, setLogoVariant] = useState("");
  const [color, setColor] = useState("black");
  const [fileType, setFileType] = useState("SVG");
  const [brandId, setBrandId] = useState(defaultBrandId ?? "");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setLogoName("");
    setLogoVariant("");
    setColor("black");
    setFileType("SVG");
    setBrandId(defaultBrandId ?? "");
    setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!file || !logoName.trim() || !logoVariant.trim() || !brandId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const selectedBrand = brands.find((b) => b.id === brandId);
    if (!selectedBrand) return;

    setUploading(true);
    try {
      const publicUrl = await uploadLogo(
        file,
        selectedBrand.slug,
        color
      );

      await addLogo({
        brand_id: selectedBrand.id,
        name: logoName.trim(),
        variant: logoVariant.trim(),
        color,
        file_type: fileType,
        storage_path: `${selectedBrand.slug}/${color}/${file.name}`,
        public_url: publicUrl,
      });

      toast.success("Logo uploaded successfully");
      resetForm();
      onOpenChange(false);
      onUploaded?.();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatBytes = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!uploading) { onOpenChange(v); if (!v) resetForm(); }
      }}
    >
      <DialogContent className="max-w-lg" style={{ borderRadius: 16 }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold" style={{ color: "#0F172A" }}>
            Add New Logo
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* File Upload Area */}
          <div
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-[#1876F4] bg-[#EEF2FF]" : "border-[#E5E7EB] hover:border-[#1876F4]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: "pointer", minHeight: 120 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              id="file-upload-input"
            />
            {file ? (
              <div className="flex flex-col items-center gap-1">
                <svg className="h-8 w-8" style={{ color: "#1876F4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "#0F172A" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{formatBytes(file.size)}</p>
              </div>
            ) : (
              <>
                <svg className="mb-3 h-8 w-8" style={{ color: "#6B7280" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
                  Drag & drop your file here or click to browse
                </p>
                <p className="mt-1 text-xs" style={{ color: "#6B7280" }}>SVG · PNG · JPG · PDF</p>
              </>
            )}
          </div>

          {/* Logo Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Logo Name *</label>
            <input
              type="text"
              value={logoName}
              onChange={(e) => setLogoName(e.target.value)}
              placeholder="e.g. Trunexa Primary Horizontal"
              className="h-10 rounded-lg border px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#1876F4]"
              style={{ borderColor: "#E5E7EB", color: "#0F172A" }}
              id="logo-name-input"
            />
          </div>

          {/* Logo Variant */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Logo Variant *</label>
            <input
              type="text"
              value={logoVariant}
              onChange={(e) => setLogoVariant(e.target.value)}
              placeholder="e.g. Primary, Icon, Stacked"
              className="h-10 rounded-lg border px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[#1876F4]"
              style={{ borderColor: "#E5E7EB", color: "#0F172A" }}
              id="logo-variant-input"
            />
          </div>

          {/* Color + File Type + Brand — 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Color</label>
              <Select value={color} onValueChange={(v) => v && setColor(v)}>
                <SelectTrigger className="rounded-lg" style={{ borderColor: "#E5E7EB", borderRadius: 8 }} id="upload-color-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6B7280" }}>File Type</label>
              <Select value={fileType} onValueChange={(v) => v && setFileType(v)}>
                <SelectTrigger className="rounded-lg" style={{ borderColor: "#E5E7EB", borderRadius: 8 }} id="upload-filetype-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SVG">SVG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="PNGx2">PNG x2</SelectItem>
                  <SelectItem value="PNGx4">PNG x4</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Brand *</label>
              <Select value={brandId} onValueChange={(v) => v && setBrandId(v)}>
                <SelectTrigger className="rounded-lg" style={{ borderColor: "#E5E7EB", borderRadius: 8 }} id="upload-brand-select">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="flex flex-col gap-1.5">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-xs" style={{ color: "#6B7280" }}>
                Uploading… {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={() => { onOpenChange(false); resetForm(); }}
              disabled={uploading}
              className="flex-1"
              style={{ borderRadius: 8 }}
              id="upload-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !file || !logoName.trim() || !logoVariant.trim() || !brandId}
              className="flex-1 font-medium"
              style={{ backgroundColor: "#1876F4", borderRadius: 8 }}
              id="upload-submit-btn"
            >
              {uploading ? "Uploading…" : "Upload Logo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
