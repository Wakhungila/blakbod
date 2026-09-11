"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "verify" | "error">(() => {
    if (typeof window === "undefined") return "idle";
    return new URLSearchParams(window.location.search).has("error") ? "error" : "idle";
  });
  const [errorMsg, setErrorMsg] = useState(() => {
    if (typeof window === "undefined") return "";
    const error = new URLSearchParams(window.location.search).get("error");
    return error === "auth_failed" ? "That verification link is invalid or has expired." : error ?? "";
  });

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
      setStatus("verify");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }
      window.location.href = "/team";
    }
  }

  async function handlePasswordReset() {
    setStatus("loading");
    setErrorMsg("");
    setResetSent(false);

    if (!email) {
      setStatus("error");
      setErrorMsg("Enter your email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("idle");
    setResetSent(true);
  }

  async function handleResendVerification() {
    setResending(true);
    setErrorMsg("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setResending(false);
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setResending(false);
    setStatus("verify");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-bone">
            The squad, online.
          </h1>
          <p className="mt-2 text-sm text-muted">
            Join up and find your teammates on Instagram, X, and TikTok.
          </p>
        </div>

        <div className="mb-6 flex rounded-full border border-line bg-surface p-1 text-sm">
          <button
            onClick={() => { setMode("signup"); setStatus("idle"); setResetSent(false); }}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              mode === "signup" ? "bg-bone text-ink" : "text-muted hover:text-bone"
            }`}
          >
            Join
          </button>
          <button
            onClick={() => { setMode("signin"); setStatus("idle"); setResetSent(false); }}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              mode === "signin" ? "bg-bone text-ink" : "text-muted hover:text-bone"
            }`}
          >
            Sign in
          </button>
        </div>

        {resetSent && (
          <div className="mb-6 rounded-2xl border border-maroon-light/40 bg-surface p-4 text-center text-sm text-muted">
            Check your inbox for a password reset link.
          </div>
        )}

        {status === "verify" ? (
          <div className="rounded-2xl border border-maroon-light/40 bg-surface p-6 text-center">
            <p className="font-medium text-bone">Check your inbox</p>
            <p className="mt-1 text-sm text-muted">
              We&apos;ve sent a verification link to <span className="text-bone">{email}</span>.
              Tap it to verify your account, then come back and sign in.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="mt-4 text-sm font-medium text-maroon-light hover:text-bone hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-muted">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
              />
            </div>

            {mode === "signin" && (
              <div className="-mt-1 text-right">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={status === "loading"}
                  className="text-sm text-maroon-light transition-colors hover:text-bone hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm text-muted">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-bone placeholder:text-muted focus:border-maroon-light"
              />
            </div>

            {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-maroon py-3 font-display font-bold text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "loading"
                ? "Working..."
                : mode === "signup"
                ? "Create account"
                : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
