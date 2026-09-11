"use client";

import { useState } from "react";
import { FollowButton } from "@/components/FollowButton";
import { fullName, positionLabel, type Platform, type Profile } from "@/lib/types";

const PLATFORMS: Platform[] = ["instagram", "twitter_x", "tiktok"];

export function PlayerCard({
  player,
  myId,
  followedPlatforms,
}: {
  player: Profile;
  myId: string;
  followedPlatforms: Set<Platform>;
}) {
  const socials = PLATFORMS.filter((p) => player[p]);
  const [followed, setFollowed] = useState(() =>
    new Set(socials.filter((platform) => followedPlatforms.has(platform)))
  );
  const [followError, setFollowError] = useState("");
  const name = fullName(player);
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="group w-full max-w-[280px] overflow-hidden rounded-[22px] border border-maroon/35 bg-surface text-bone shadow-[0_18px_45px_rgba(0,0,0,0.2)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-maroon-light/50 hover:shadow-[0_24px_55px_rgba(0,0,0,0.32)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-maroon-dim">
        {player.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatar_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-maroon-dim font-display text-5xl font-bold text-bone">
            {initials || "?"}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-surface via-surface/35 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface via-surface/60 to-transparent opacity-95 transition-opacity duration-300 group-hover:opacity-100" />
        {positionLabel(player) && (
          <p className="absolute left-4 top-4 rounded-full border border-bone/20 bg-ink/25 px-4 py-2 font-display text-sm font-bold text-bone shadow-lg backdrop-blur-md sm:text-base">
            {positionLabel(player)}
          </p>
        )}
        <div className="absolute inset-x-4 bottom-5 text-center">
          <h3 className="truncate font-display text-xl font-black tracking-tight text-bone sm:text-2xl">{name}</h3>
          {player.display_name?.trim() && (
            <p className="mt-1 truncate text-sm font-medium text-bone/75 sm:text-base">
              Nickname: {player.display_name.trim()}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        {socials.length === 0 ? (
          <p className="py-2 text-center text-sm italic text-muted">No socials added yet</p>
        ) : (
          <>
            <div className="relative flex items-center justify-center gap-1 pb-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-line after:to-transparent">
              {socials.map((platform) => (
                <FollowButton
                  key={platform}
                  myId={myId}
                  playerId={player.id}
                  platform={platform}
                  username={player[platform]!}
                  initiallyFollowed={followed.has(platform)}
                  compact
                  onFollowChange={(isFollowed) => {
                    setFollowed((current) => {
                      const next = new Set(current);
                      if (isFollowed) next.add(platform);
                      else next.delete(platform);
                      return next;
                    });
                    setFollowError("");
                  }}
                  onError={setFollowError}
                />
              ))}
            </div>
            <div className="mt-3 border-t border-line/70 pt-3 text-center text-sm font-medium text-muted">
              {followed.size} of {socials.length} followed
            </div>
            {followError && <p className="mt-2 text-center text-xs text-red-400">{followError}</p>}
          </>
        )}
      </div>
    </article>
  );
}
