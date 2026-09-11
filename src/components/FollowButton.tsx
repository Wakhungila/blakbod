"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PlatformIcon } from "@/components/PlatformIcon";
import { platformUrl, type Platform } from "@/lib/types";

export function FollowButton({
  myId,
  playerId,
  platform,
  username,
  initiallyFollowed,
  compact = false,
  onFollowChange,
  onError,
}: {
  myId: string;
  playerId: string;
  platform: Platform;
  username: string;
  initiallyFollowed: boolean;
  compact?: boolean;
  onFollowChange?: (followed: boolean) => void;
  onError?: (message: string) => void;
}) {
  const [followed, setFollowed] = useState(initiallyFollowed);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  function handleClick() {
    // Always open the profile — that's the actual "follow" action on the platform
    window.open(platformUrl(platform, username), "_blank", "noopener,noreferrer");

    if (followed) return; // already marked, nothing more to do

    startTransition(async () => {
      const { error } = await supabase
        .from("follows")
        .upsert({ follower_id: myId, followed_id: playerId, platform });
      if (error) {
        onError?.("Could not save that follow. Try again.");
        return;
      }
      setFollowed(true);
      onFollowChange?.(true);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 transition-[color,transform] duration-200 hover:scale-105 active:scale-95 ${
        compact
          ? "relative min-w-0 flex-1 border-0 px-2 py-1.5 text-xs"
          : "rounded-full border px-3 py-2 text-sm"
      } ${
        followed
          ? compact
            ? "text-maroon"
            : "border-maroon-light/50 bg-maroon/20 text-maroon-light"
          : compact
            ? "text-muted hover:text-maroon-light"
            : "border-line bg-surface text-bone hover:border-maroon-light hover:text-maroon-light"
      }`}
      title={followed ? "Marked as followed — click to open profile again" : `Open ${username} and mark as followed`}
    >
      <span
        className={
          compact
            ? `relative flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                followed
                  ? "border-maroon bg-maroon text-bone"
                  : "border-line text-muted hover:border-maroon-light"
              }`
            : "contents"
        }
      >
        <PlatformIcon platform={platform} className={compact ? "h-6 w-6" : "h-3.5 w-3.5"} />
        {compact && followed && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-emerald-500 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </span>
      {compact && <span className="sr-only">{username}</span>}
      {!compact && <span>@{username.replace(/^@/, "")}</span>}
      {followed && !compact && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}
