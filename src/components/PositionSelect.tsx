"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { RUGBY_POSITIONS } from "@/lib/types";

function PositionField({
  label,
  value,
  options,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(options.indexOf(value), 0);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function choose(option: string) {
    onChange(option);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (selectedIndex + direction + options.length) % options.length;
      choose(options[nextIndex]);
    }
  }

  return (
    <div ref={fieldRef} className="relative min-w-0">
      <label className="mb-1.5 block text-sm text-muted">{label}</label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-left text-sm transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-maroon-light/40 ${
          open ? "border-maroon-light" : "border-line hover:border-maroon-light/60"
        }`}
      >
        <span className={value ? "text-bone" : "text-muted"}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {required && <input type="text" required value={value} onChange={() => undefined} tabIndex={-1} className="sr-only" aria-hidden="true" />}

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-maroon/60 bg-surface-raised p-1 shadow-[0_16px_35px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => choose(option)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                value === option
                  ? "bg-maroon text-bone"
                  : "text-muted hover:bg-maroon/25 hover:text-bone"
              }`}
            >
              <span>{option || placeholder}</span>
              {value === option && <Check className="h-4 w-4" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PositionSelect({
  primary,
  secondary,
  onPrimaryChange,
  onSecondaryChange,
}: {
  primary: string;
  secondary: string;
  onPrimaryChange: (v: string) => void;
  onSecondaryChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PositionField
        label="Position"
        value={primary}
        options={RUGBY_POSITIONS}
        placeholder="Select position"
        required
        onChange={onPrimaryChange}
      />
      <PositionField
        label="2nd position (optional)"
        value={secondary}
        options={["", ...RUGBY_POSITIONS.filter((pos) => pos !== primary)]}
        placeholder="None"
        onChange={onSecondaryChange}
      />
    </div>
  );
}
