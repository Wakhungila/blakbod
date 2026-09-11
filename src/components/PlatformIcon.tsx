import type { Platform } from "@/lib/types";

// Brand glyphs drawn as simple custom SVGs — lucide-react no longer ships
// brand/logo icons, so these keep the platform marks recognizable without
// pulling in a separate icon-set dependency.

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.93-.9-1.44-2.14-1.44-3.47h-3.16v13.9a2.7 2.7 0 1 1-2.7-2.7c.26 0 .5.03.74.09V10.5a5.87 5.87 0 0 0-.74-.05A5.86 5.86 0 1 0 15.16 16.3V9.2a8.95 8.95 0 0 0 5.16 1.65V7.7a5.4 5.4 0 0 1-3.72-1.88z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = "h-4 w-4",
}: {
  platform: Platform;
  className?: string;
}) {
  switch (platform) {
    case "instagram":
      return <InstagramGlyph className={className} />;
    case "twitter_x":
      return <XGlyph className={className} />;
    case "tiktok":
      return <TikTokGlyph className={className} />;
  }
}
