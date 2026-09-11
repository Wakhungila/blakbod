import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { TeamDirectory } from "@/components/TeamDirectory";
import { SocialSetupPrompt } from "@/components/SocialSetupPrompt";
import { preferredName, type Follow, type Platform, type Profile } from "@/lib/types";

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

  const missingSocials = (["instagram", "twitter_x", "tiktok"] as Platform[]).filter(
    (platform) => !me[platform]
  );

  return (
    <>
      <NavBar activePage="team" />
      <SocialSetupPrompt
        userId={user.id}
        firstName={me.first_name?.trim() || "there"}
        missingPlatforms={missingSocials}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 sm:mb-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone sm:text-3xl lg:text-4xl">
            Hello, {preferredName(me)}, let&apos;s connect!
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Tap a Yudhee handle to open their profile and follow them!
          </p>
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
