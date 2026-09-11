"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NavBar } from "@/components/NavBar";
import { PlatformIcon } from "@/components/PlatformIcon";
import { AvatarUpload } from "@/components/AvatarUpload";
import { PositionSelect } from "@/components/PositionSelect";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [userId, setUserId] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      setAccountEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
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
    setSaved(false);
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
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        position_primary: positionPrimary,
        position_secondary: positionSecondary || null,
        instagram: instagram.trim() || null,
        twitter_x: twitterX.trim() || null,
        tiktok: tiktok.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function handleAccountUpdate(e: React.FormEvent) {
    e.preventDefault();
    setAccountStatus("");
    setAccountError("");

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError("Passwords do not match.");
      return;
    }
    if (!newEmail && !newPassword) {
      setAccountError("Enter a new email or password first.");
      return;
    }

    setAccountSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      ...(newEmail ? { email: newEmail.trim() } : {}),
      ...(newPassword ? { password: newPassword } : {}),
    });
    setAccountSaving(false);

    if (updateError) {
      setAccountError(updateError.message);
      return;
    }

    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setAccountStatus(newEmail ? "Check your email to confirm the address change." : "Password updated successfully.");
    if (newEmail) setAccountEmail(newEmail.trim());
  }

  if (loading) {
    return (
      <>
        <NavBar activePage="profile" />
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted">Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar activePage="profile" />
      <main className="mx-auto max-w-lg px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">
            My profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            Keep this current — it&apos;s what teammates see and use to follow you.
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
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
              />
            </div>
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
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </button>
        </form>

        <section className="mt-12 border-t border-line pt-8">
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-bone">Account settings</h2>
            <p className="mt-1 text-sm text-muted">Update the email or password used to sign in.</p>
          </div>
          <form onSubmit={handleAccountUpdate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted">Current email</label>
              <input value={accountEmail} readOnly className="w-full rounded-xl border border-line bg-surface-raised px-4 py-3 text-muted" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">New email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light" />
              <input type="password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light" />
            </div>
            {accountError && <p className="text-sm text-red-400">{accountError}</p>}
            {accountStatus && <p className="text-sm text-emerald-400">{accountStatus}</p>}
            <button type="submit" disabled={accountSaving} className="w-full rounded-full border border-maroon-light/60 py-3 font-display font-bold text-bone transition-colors hover:bg-maroon/20 disabled:opacity-50">
              {accountSaving ? "Updating..." : "Update account"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
