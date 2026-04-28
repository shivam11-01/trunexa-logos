"use client";

import { Button } from "@/components/ui/button";

interface AddLogoButtonProps {
  onClick: () => void;
}

export function AddLogoButton({ onClick }: AddLogoButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="ml-auto shrink-0 h-10 px-4 text-sm font-medium transition-colors hover:opacity-90"
      style={{
        backgroundColor: "#1876F4",
        color: "white",
        borderRadius: 12,
      }}
      id="add-logo-btn"
    >
      Add Logo
    </Button>
  );
}
