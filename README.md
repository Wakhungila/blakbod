# BLAKBOD

The internal social network for Blakblad RC. Players sign up, verify their email, build a
profile (photo, name, rugby position), add their Instagram / X / TikTok usernames, and follow
each other with one tap — no platform APIs involved. BLAKBOD just links out to the real app/
website and lets each player self-report who they've followed, so you (the social media manager)
can see team-wide follow completion.

## How it works

- **Sign up** — email + password. Supabase sends a verification link; once the player clicks it,
  they're verified and can sign in. Open signup — anyone with the link can join, no approval step.
- **Onboarding** (required before appearing in the directory) — profile picture, first name, last
  name, and rugby position (prop, hooker, lock, flanker, 8th man, scrumhalf, flyhalf, centre,
  wing, fullback — with an optional second position for hybrid players). Social handles are
  optional.
- **Team directory** (`/team`) — every player who has *completed onboarding* shows up with their
  photo, name, position(s), and clickable social handles. Players who haven't finished their
  profile yet stay out of the directory.
- **Follow tracking** — clicking a handle opens that platform in a new tab (the real "follow"
  happens there, manually) and marks it as followed in BLAKBOD. A progress bar shows each
  player's own completion against the whole squad.
- **No APIs, no OAuth with Instagram/X/TikTok** — those platforms don't expose a "follow" action
  to third-party apps, so this app never claims to do it for you. It just makes the manual task
  fast, visible, and trackable.

## Brand

- Background: near-black (`#0A0A0A`)
- Accent: maroon (`#6A0320`), matching the BlakBod logo pill
- Text: bone white (`#F5F5F0`)
- Display type: Archivo Expanded (bold/black weights); body: Archivo

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Supabase (Postgres + Auth + Storage, via `@supabase/ssr`)
- Deployed on Vercel

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste in the contents of `supabase/schema.sql`, and run it.
   This creates:
   - An `avatars` storage bucket (public read, write restricted to each user's own folder)
   - `profiles` table — `first_name`, `last_name`, `position_primary`, `position_secondary`,
     `instagram`, `twitter_x`, `tiktok`, `avatar_url`, `onboarded` (with RLS: everyone can read,
     you can only edit your own row)
   - `follows` table (with RLS: everyone can read, you can only insert/delete your own records)
   - A trigger that auto-creates a blank profile row whenever someone signs up
   - A `follow_stats` view (handy if you want team-wide reporting later)
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your production URL (e.g. `https://blakbod.vercel.app`)
   - **Redirect URLs**: add `https://blakbod.vercel.app/auth/callback` (and
     `http://localhost:3000/auth/callback` for local dev)
4. Go to **Authentication → Providers → Email** and make sure Email is enabled with **"Confirm
   email" turned ON** — this is what sends the verification link players must click before they
   can sign in.
5. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon` `public` key

## 2. Configure environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`. Create an account, verify your
email via the link Supabase sends, sign in, complete `/onboarding` (photo + name + position are
required), and you'll land on `/team`.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. Once you have your `*.vercel.app` URL (or a custom domain), go back to Supabase
   **Authentication → URL Configuration** and update the Site URL / Redirect URLs to match.

## 5. Share it with the squad

Send the players the live URL. Each player:
1. Signs up with email + password
2. Clicks the verification link Supabase emails them
3. Signs in, then completes onboarding: profile picture, name, position(s), optional socials
4. Lands on the squad directory and starts following teammates

## Project structure

```
src/
  app/
    login/           Sign up / sign in
    auth/callback/   Handles the email verification redirect
    onboarding/      First-time profile setup (photo, name, position — required)
    team/            The squad directory (server component, onboarded players only)
    profile/         Edit your own profile
  components/
    PlayerCard.tsx      A single player's card in the directory
    FollowButton.tsx    Opens the platform + marks as followed
    PlatformIcon.tsx    Instagram / X / TikTok glyphs
    AvatarUpload.tsx    Profile picture upload to Supabase Storage
    PositionSelect.tsx  Primary/secondary rugby position dropdowns
    NavBar.tsx, Logo.tsx, SignOutButton.tsx
  lib/
    supabase/         Browser, server, and middleware Supabase clients
    types.ts          Shared types, rugby position list, platform URL builder
supabase/
  schema.sql          Run this in the Supabase SQL editor
```



