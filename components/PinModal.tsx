"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const PIN_LENGTH = 6;

interface PinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinModal({ open, onOpenChange, onSuccess, title, description }: PinModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(PIN_LENGTH).fill(""));
      setError("");
      setShake(false);
      setSuccess(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");

    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Auto-verify when last digit filled
      const pin = [...next].join("");
      verifyPin(pin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      setError("");
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, PIN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === PIN_LENGTH) verifyPin(pasted);
  };

  const verifyPin = (pin: string) => {
    const correctPin = process.env.NEXT_PUBLIC_UPLOAD_PIN ?? "123456";
    if (pin === correctPin) {
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 500);
    } else {
      setError("Incorrect PIN. Please try again.");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setDigits(Array(PIN_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  const filledCount = digits.filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setDigits(Array(PIN_LENGTH).fill("")); setError(""); }}>
      <DialogContent
        className="overflow-hidden border-0 p-0 [&>[data-slot=dialog-close]]:text-white/80 [&>[data-slot=dialog-close]]:hover:text-white [&>[data-slot=dialog-close]]:hover:bg-white/10"
        style={{ borderRadius: 24, maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Header gradient band */}
        <div
          className="relative flex flex-col items-center px-8 pt-10 pb-8"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1876F4 100%)",
          }}
        >
          {/* Shield icon */}
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white">{title ?? "Admin Access"}</h2>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {description ?? "Enter your 6-digit PIN to continue"}
          </p>

          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-10" style={{ background: "#1876F4", filter: "blur(40px)" }} />
          <div className="pointer-events-none absolute -left-4 bottom-0 h-32 w-32 rounded-full opacity-10" style={{ background: "#60A5FA", filter: "blur(30px)" }} />
        </div>

        {/* PIN inputs */}
        <div className="flex flex-col items-center gap-6 px-8 py-8" style={{ backgroundColor: "#FFFFFF" }}>
          <div
            className={`flex gap-3 transition-all ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onClick={() => inputRefs.current[i]?.select()}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                data-1p-ignore
                name={`pin-digit-${i}-${Math.random()}`}
                className="h-12 w-12 rounded-lg border-2 text-center text-xl font-bold outline-none transition-all duration-150"
                style={{
                  borderColor: success
                    ? "#22c55e"
                    : error
                      ? "#ef4444"
                      : digit
                        ? "#1876F4"
                        : "#E5E7EB",
                  backgroundColor: success
                    ? "#f0fdf4"
                    : error
                      ? "#fef2f2"
                      : digit
                        ? "#EEF2FF"
                        : "#F8F9FB",
                  color: "#0F172A",
                  boxShadow: digit && !error && !success ? "0 0 0 3px rgba(24,118,244,0.12)" : "none",
                  // WebkitTextSecurity: digit ? "disc" : "none",
                  fontFamily: digit ? "text-security-disc, monospace" : "inherit",
                }}
                id={`pin-input-${i}`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i < filledCount ? 20 : 6,
                  height: 6,
                  backgroundColor: i < filledCount
                    ? (success ? "#22c55e" : error ? "#ef4444" : "#1876F4")
                    : "#E5E7EB",
                }}
              />
            ))}
          </div>

          {/* Error message */}
          <div className="h-5 flex items-center">
            {error && (
              <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#ef4444" }}>
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#22c55e" }}>
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Access granted!
              </p>
            )}
          </div>

          {/* Hint */}
          <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
            PIN auto-verifies when all 6 digits are entered
          </p>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-6px); }
            30% { transform: translateX(6px); }
            45% { transform: translateX(-6px); }
            60% { transform: translateX(6px); }
            75% { transform: translateX(-4px); }
            90% { transform: translateX(4px); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
