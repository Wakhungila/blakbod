"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { PlatformIcon } from "@/components/PlatformIcon";
import { AvatarUpload } from "@/components/AvatarUpload";
import { PositionSelect } from "@/components/PositionSelect";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [positionPrimary, setPositionPrimary] = useState("");
  const [positionSecondary, setPositionSecondary] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitterX, setTwitterX] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setDisplayName(profile.display_name ?? "");
        setPositionPrimary(profile.position_primary ?? "");
        setPositionSecondary(profile.position_secondary ?? "");
        setInstagram(profile.instagram ?? "");
        setTwitterX(profile.twitter_x ?? "");
        setTiktok(profile.tiktok ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!avatarUrl) {
      setError("A profile picture is required so teammates can recognize you.");
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: displayName.trim() || null,
        position_primary: positionPrimary,
        position_secondary: positionSecondary || null,
        instagram: instagram.trim() || null,
        twitter_x: twitterX.trim() || null,
        tiktok: tiktok.trim() || null,
        avatar_url: avatarUrl,
        onboarded: true,
      }, { onConflict: "id" });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/team");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-16">
      <div className="mb-10 flex justify-center">
        <Logo />
      </div>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">
          Get on the team sheet.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Photo, name, and position are required so teammates can recognize you. Social handles are optional — add whichever you use.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <AvatarUpload userId={userId} currentUrl={avatarUrl} onUploaded={setAvatarUrl} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-muted">First name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Brian"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Last name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Omondi"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-muted">Display name <span className="text-muted/70">(optional)</span></label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your nickname"
            maxLength={40}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
          />
        </div>

        <PositionSelect
          primary={positionPrimary}
          secondary={positionSecondary}
          onPrimaryChange={setPositionPrimary}
          onSecondaryChange={setPositionSecondary}
        />

        <div className="border-t border-line pt-6">
          <p className="mb-4 text-sm font-medium text-bone">Social handles</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 focus-within:border-maroon-light">
              <PlatformIcon platform="instagram" className="h-4 w-4 shrink-0 text-muted" />
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="instagram username"
                className="w-full bg-transparent text-bone placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 focus-within:border-maroon-light">
              <PlatformIcon platform="twitter_x" className="h-4 w-4 shrink-0 text-muted" />
              <input
                type="text"
                value={twitterX}
                onChange={(e) => setTwitterX(e.target.value)}
                placeholder="X (Twitter) username"
                className="w-full bg-transparent text-bone placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 focus-within:border-maroon-light">
              <PlatformIcon platform="tiktok" className="h-4 w-4 shrink-0 text-muted" />
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="TikTok username"
                className="w-full bg-transparent text-bone placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-maroon py-3 font-display font-bold text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Join the squad"}
        </button>
      </form>
    </main>
  );
}
