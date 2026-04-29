"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormatOption = "svg" | "png" | "jpg" | "pdf";

interface FormatSelectProps {
  value: FormatOption;
  onChange: (value: FormatOption) => void;
  availableFormats: FormatOption[];
}

const formatLabels: Record<FormatOption, string> = {
  svg: "SVG",
  png: "PNG",
  jpg: "JPG",
  pdf: "PDF",
};

export function FormatSelect({ value, onChange, availableFormats }: FormatSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FormatOption)}>
      <SelectTrigger
        className="w-full rounded-lg"
        style={{ borderColor: "#E5E7EB", borderRadius: 8 }}
        id="format-select"
      >
        <SelectValue placeholder="Select format" />
      </SelectTrigger>
      <SelectContent>
        {availableFormats.map((fmt) => (
          <SelectItem key={fmt} value={fmt}>
            {formatLabels[fmt]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
