export type Platform = "instagram" | "twitter_x" | "tiktok";

export const RUGBY_POSITIONS = [
  "Prop",
  "Hooker",
  "Lock",
  "Flanker",
  "8th Man",
  "Scrumhalf",
  "Flyhalf",
  "Centre",
  "Wing",
  "Fullback",
] as const;

export type RugbyPosition = (typeof RUGBY_POSITIONS)[number];

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  position_primary: string | null;
  position_secondary: string | null;
  instagram: string | null;
  twitter_x: string | null;
  tiktok: string | null;
  avatar_url: string | null;
  onboarded: boolean;
  created_at: string;
};

export function fullName(p: Pick<Profile, "first_name" | "last_name" | "display_name">): string {
  return [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
}

export function preferredName(p: Pick<Profile, "first_name" | "display_name">): string {
  return p.display_name?.trim() || p.first_name?.trim() || "there";
}

export function positionLabel(p: Pick<Profile, "position_primary" | "position_secondary">): string {
  return [p.position_primary, p.position_secondary].filter(Boolean).join(" / ");
}

export type Follow = {
  follower_id: string;
  followed_id: string;
  platform: Platform;
  followed_at: string;
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  twitter_x: "X",
  tiktok: "TikTok",
};

export function platformUrl(platform: Platform, username: string): string {
  const clean = username.trim().replace(/^@/, "");
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${clean}`;
    case "twitter_x":
      return `https://x.com/${clean}`;
    case "tiktok":
      return `https://tiktok.com/@${clean}`;
  }
}
