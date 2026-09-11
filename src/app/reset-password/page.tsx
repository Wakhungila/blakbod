"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setStatus("error");
      setError("Passwords do not match.");
      return;
    }

    setStatus("loading");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }

    setStatus("saved");
    setTimeout(() => router.replace("/team"), 1200);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center"><Logo /></div>
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">Set a new password</h1>
          <p className="mt-2 text-sm text-muted">Choose a new password for your BLAKBOD account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
          />
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {status === "saved" && <p className="text-sm text-emerald-400">Password updated. Taking you to the squad...</p>}
          <button
            type="submit"
            disabled={status === "loading" || status === "saved"}
            className="w-full rounded-full bg-maroon py-3 font-display font-bold text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}