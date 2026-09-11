"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { type Platform } from "@/lib/types";

const PLATFORM_DETAILS: Record<Platform, { label: string; signupUrl: string }> = {
  instagram: { label: "Instagram", signupUrl: "https://www.instagram.com/accounts/emailsignup/" },
  twitter_x: { label: "X", signupUrl: "https://x.com/i/flow/signup" },
  tiktok: { label: "TikTok", signupUrl: "https://www.tiktok.com/signup" },
};

export function SocialSetupPrompt({
  userId,
  firstName,
  missingPlatforms,
}: {
  userId: string;
  firstName: string;
  missingPlatforms: Platform[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (missingPlatforms.length === 0) return;
    const dismissed = window.localStorage.getItem(`social-prompt-dismissed:${userId}`);
    if (!dismissed) {
      const timer = window.setTimeout(() => setOpen(true), 900);
      return () => window.clearTimeout(timer);
    }
  }, [missingPlatforms.length, userId]);

  function dismiss() {
    window.localStorage.setItem(`social-prompt-dismissed:${userId}`, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-prompt-title"
        className="relative w-full max-w-md animate-[social-prompt-in_400ms_ease-out] rounded-[24px] border border-maroon-light/35 bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-7"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close social account prompt"
          className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-surface-raised hover:text-bone"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-8">
          <p className="mb-2 overflow-hidden whitespace-nowrap font-display text-sm text-maroon-light [animation:social-prompt-type_1.8s_steps(34,end)_both]">
            One more step, {firstName}...
          </p>
          <h2 id="social-prompt-title" className="font-display text-xl font-extrabold tracking-tight text-bone sm:text-2xl">
            Let&apos;s get you connected.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            You&apos;re missing {missingPlatforms.length} social account{missingPlatforms.length === 1 ? "" : "s"}: {missingPlatforms.map((platform) => PLATFORM_DETAILS[platform].label).join(", ")}.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {missingPlatforms.map((platform) => {
            const details = PLATFORM_DETAILS[platform];
            return (
              <a
                key={platform}
                href={details.signupUrl}
                target="_blank"
                rel="noreferrer"
                onClick={dismiss}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-ink/25 p-3 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-maroon-light hover:bg-maroon/20"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-maroon-light transition-colors group-hover:border-maroon-light group-hover:bg-maroon group-hover:text-bone">
                  <PlatformIcon platform={platform} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-bone">Join {details.label}</span>
                  <span className="block text-xs text-muted">Open signup</span>
                </span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-full border border-line py-2.5 text-sm font-medium text-muted transition-colors hover:border-maroon-light hover:text-bone"
        >
          Maybe later
        </button>
      </section>
    </div>
  );
}
