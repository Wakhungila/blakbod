import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { TeamDirectory } from "@/components/TeamDirectory";
import type { Follow, Platform, Profile } from "@/lib/types";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!me?.onboarded) redirect("/onboarding");

  // Only players who've completed onboarding show up in the directory —
  // an incomplete profile (no photo/name/position) isn't useful to teammates yet.
  const { data: playersRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("onboarded", true)
    .neq("id", user.id)
    .order("first_name", { ascending: true });

  const players = (playersRaw ?? []) as Profile[];

  const { data: myFollowsRaw } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id);

  const myFollows = (myFollowsRaw ?? []) as Follow[];

  const activePlatformsByPlayer = new Map(
    players.map((player) => [
      player.id,
      new Set<Platform>(
        (["instagram", "twitter_x", "tiktok"] as Platform[]).filter((platform) => Boolean(player[platform]))
      ),
    ])
  );
  const followMap = new Map<string, Set<Platform>>();
  for (const f of myFollows) {
    if (!activePlatformsByPlayer.get(f.followed_id)?.has(f.platform)) continue;
    if (!followMap.has(f.followed_id)) followMap.set(f.followed_id, new Set());
    followMap.get(f.followed_id)!.add(f.platform);
  }

  // Team-wide completion stat
  const totalPossible = players.reduce(
    (sum, p) => sum + (p.instagram ? 1 : 0) + (p.twitter_x ? 1 : 0) + (p.tiktok ? 1 : 0),
    0
  );
  const myCompleted = Array.from(followMap.values()).reduce((sum, platforms) => sum + platforms.size, 0);
  const pct = totalPossible > 0 ? Math.round((myCompleted / totalPossible) * 100) : 100;

  return (
    <>
      <NavBar activePage="team" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 sm:mb-8">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-bone sm:text-2xl">
            Hello, {me.display_name?.trim() || me.first_name}, let&apos;s connect!
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {players.length} yudhee on BLAKBOD. Tap a handle to open their profile and mark them followed.
          </p>

          {totalPossible > 0 && (
            <div className="mt-5 max-w-2xl rounded-2xl border border-line bg-surface p-3.5 sm:p-4">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-bone">Your follow completion</span>
                <span className="font-display text-sm font-bold text-maroon-light">
                  {myCompleted}/{totalPossible} · {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-maroon-light transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {players.length === 0 ? (
          <div className="max-w-2xl rounded-2xl border border-line bg-surface p-6 text-center sm:p-8">
            <p className="text-bone">No yudhee yet.</p>
            <p className="mt-1 text-sm text-muted">
              Share the BLAKBOD link with the squad — as soon as they verify their email and complete their profile, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <TeamDirectory
            players={players}
            myId={user.id}
            followedByPlayer={Object.fromEntries(
              Array.from(followMap.entries()).map(([playerId, platforms]) => [playerId, Array.from(platforms)])
            )}
          />
        )}
      </main>
    </>
  );
}
