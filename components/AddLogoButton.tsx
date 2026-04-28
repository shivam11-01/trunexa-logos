"use client";

import { Button } from "@/components/ui/button";

interface AddLogoButtonProps {
  onClick: () => void;
}

export function AddLogoButton({ onClick }: AddLogoButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="ml-auto shrink-0 text-sm font-medium transition-colors hover:bg-[#EEF2FF]"
      style={{
        borderColor: "#1876F4",
        color: "#1876F4",
        borderRadius: 8,
      }}
      id="add-logo-btn"
    >
      + Add Logo
    </Button>
  );
}
