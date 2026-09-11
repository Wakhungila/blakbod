"use client";

import { useMemo, useState } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { positionLabel, type Platform, type Profile } from "@/lib/types";

export function TeamDirectory({
  players,
  myId,
  followedByPlayer,
}: {
  players: Profile[];
  myId: string;
  followedByPlayer: Record<string, Platform[]>;
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("all");

  const positions = useMemo(
    () => Array.from(new Set(players.flatMap((player) => positionLabel(player).split(" / ").filter(Boolean)))).sort(),
    [players]
  );
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return players.filter((player) => {
      const name = `${player.first_name ?? ""} ${player.last_name ?? ""}`.toLowerCase();
      const displayName = player.display_name?.toLowerCase() ?? "";
      const handles = [player.instagram, player.twitter_x, player.tiktok]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || name.includes(normalizedQuery) || displayName.includes(normalizedQuery) || handles.includes(normalizedQuery);
      const matchesPosition = position === "all" || positionLabel(player).split(" / ").includes(position);
      return matchesQuery && matchesPosition;
    });
  }, [players, position, query]);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row">
        <label className="flex min-w-0 flex-1 items-center rounded-xl border border-line bg-ink/30 px-3 focus-within:border-maroon-light">
          <span className="mr-2 text-muted" aria-hidden="true">⌕</span>
          <span className="sr-only">Search squad</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or handle"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-bone placeholder:text-muted focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-ink/30 px-3 text-sm text-muted focus-within:border-maroon-light sm:w-48">
          <span className="sr-only">Filter by position</span>
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className="w-full bg-transparent py-2 text-bone focus:outline-none"
          >
            <option value="all">All positions</option>
            {positions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-bone">No matches found.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setPosition("all"); }}
            className="mt-2 text-sm text-maroon-light hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),280px))] justify-start gap-5">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              myId={myId}
              followedPlatforms={new Set(followedByPlayer[player.id] ?? [])}
            />
          ))}
        </div>
      )}
    </section>
  );
}
