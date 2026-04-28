"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PinModal({ open, onOpenChange, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = () => {
    const correctPin = process.env.NEXT_PUBLIC_UPLOAD_PIN ?? "1234";
    if (pin === correctPin) {
      setPin("");
      setError("");
      onOpenChange(false);
      onSuccess();
    } else {
      setError("Incorrect PIN. Try again.");
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setPin(""); setError(""); }}>
      <DialogContent className="max-w-sm" style={{ borderRadius: 16 }}>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold" style={{ color: "#0F172A" }}>
            Enter PIN to continue
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="••••"
            className="h-14 w-32 rounded-xl border text-center text-3xl font-bold tracking-[0.5em] outline-none transition-all focus:ring-2 focus:ring-[#1876F4]"
            style={{ borderColor: error ? "#ef4444" : "#E5E7EB", color: "#0F172A" }}
            id="pin-input"
            autoFocus
          />
          {error && (
            <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
          <Button
            onClick={handleVerify}
            disabled={pin.length < 4}
            className="h-11 w-full font-medium"
            style={{ backgroundColor: "#1876F4", borderRadius: 8 }}
            id="pin-verify-btn"
          >
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
