"use client";

import { RUGBY_POSITIONS } from "@/lib/types";

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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1.5 block text-sm text-muted">Position</label>
        <select
          required
          value={primary}
          onChange={(e) => onPrimaryChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone focus:border-maroon-light"
        >
          <option value="" disabled>
            Select position
          </option>
          {RUGBY_POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-muted">2nd position (optional)</label>
        <select
          value={secondary}
          onChange={(e) => onSecondaryChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone focus:border-maroon-light"
        >
          <option value="">None</option>
          {RUGBY_POSITIONS.filter((pos) => pos !== primary).map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
