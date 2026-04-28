import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Logo Repository — Trunexa",
  description:
    "Download and use official logos for all Trunexa brands. Available in SVG, PNG, and PDF formats.",
  openGraph: {
    title: "Logo Repository — Trunexa",
    description:
      "Download and use official logos for all Trunexa brands. Available in SVG, PNG, and PDF formats.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} antialiased`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-white font-sans"
        style={{ scrollBehavior: "smooth" }}
        suppressHydrationWarning
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
