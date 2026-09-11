"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="ml-1 rounded-full p-2 text-muted transition-colors hover:text-bone"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
