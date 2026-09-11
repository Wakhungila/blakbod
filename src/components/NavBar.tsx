import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

export function NavBar({ activePage }: { activePage: "team" | "profile" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/team">
          <Logo className="text-sm" />
        </Link>
        <nav className="flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
          <Link
            href="/team"
            className={`rounded-full px-3 py-2 font-medium transition-colors sm:px-4 ${
              activePage === "team" ? "bg-bone text-ink" : "text-muted hover:text-bone"
            }`}
          >
            Squad
          </Link>
          <Link
            href="/profile"
            className={`rounded-full px-3 py-2 font-medium transition-colors sm:px-4 ${
              activePage === "profile" ? "bg-bone text-ink" : "text-muted hover:text-bone"
            }`}
          >
            My profile
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
