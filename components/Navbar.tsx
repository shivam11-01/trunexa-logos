"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AddLogoButton } from "@/components/AddLogoButton";
import { PinModal } from "@/components/PinModal";
import { UploadLogoModal } from "@/components/UploadLogoModal";
import { brands } from "@/lib/brands.config";

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbBrands, setDbBrands] = useState<any[]>([]);
  const [pinOpen, setPinOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    // Fetch brands for menu
    import("@/lib/db").then(({ getBrands }) => {
      getBrands().then(setDbBrands).catch(() => {});
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const el = document.getElementById(`brand-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
      style={{ borderBottom: "1px solid #E5E7EB" }}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Text */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/trunexa.svg"
            alt="Trunexa"
            width={120}
            height={40}
            className="h-8 w-auto"
            unoptimized
          />
        </Link>

        {/* Right: Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="group relative">
            <button
              className="text-sm font-medium transition-colors hover:text-[#1876F4]"
              style={{ color: "#0F172A" }}
            >
              Brands
            </button>
            <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
              <div
                className="min-w-[180px] rounded-xl border bg-white p-2 shadow-lg"
                style={{ borderColor: "#E5E7EB" }}
              >
                {dbBrands.map((brand) => (
                  <a
                    key={brand.id}
                    href={`#brand-${brand.slug}`}
                    onClick={(e) => handleBrandClick(e, brand.slug)}
                    className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F8F9FB]"
                    style={{ color: "#0F172A" }}
                  >
                    {brand.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <AddLogoButton onClick={() => setPinOpen(true)} />
        </div>
        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-lg p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="border-t px-4 pb-4 pt-2 md:hidden"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="space-y-1">
            {dbBrands.map((brand) => (
              <a
                key={brand.id}
                href={`#brand-${brand.slug}`}
                onClick={(e) => handleBrandClick(e, brand.slug)}
                className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#F8F9FB]"
                style={{ color: "#0F172A" }}
              >
                {brand.name}
              </a>
            ))}
          </div>
          <div className="mt-4">
            <AddLogoButton onClick={() => { setPinOpen(true); setMobileMenuOpen(false); }} />
          </div>
        </div>
      )}
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
        brands={dbBrands}
        onUploaded={() => {
          router.refresh();
        }}
      />
    </nav>
  );
}
