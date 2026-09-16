# Kids Map

An Urdu-first, responsive leadership adventure for children ages 6–12, with a parent or teacher nearby. Switch to English in the header.

## What works

- Interactive illustrated map and an OpenStreetMap view of five Pakistani cities.
- Five at-home missions: kindness, teamwork, courage, care for nature and listening.
- Three-question leadership game with feedback and retries.
- Six collectible badges, unique completion tracking, and 30 XP per activity.
- Browser persistence; optional parent email login and Supabase progress sync.
- No child names, photos, chat, geolocation or public leaderboards.

The geographic markers are educational city references, not venues or travel instructions. OpenStreetMap tiles and Google Fonts require internet access. The illustrated map and missions are bundled with the app.

## Run locally

Use Node.js 22.12+ and pnpm 11.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Set VITE_SUPABASE_PUBLISHABLE_KEY in .env.local
pnpm dev
```

```sh
pnpm test
pnpm build
pnpm preview
```

In a restricted Windows sandbox, Vite's config bundler may not read ancestor directories. Use `node node_modules/vite/bin/vite.js build --configLoader native`, then `node node_modules/vite/bin/vite.js preview --configLoader native` to test the production build.

## Supabase

Project: `odymsbqiasftyqtcumya`.

1. Run `supabase/migrations/202609150001_progress.sql` once in the project's SQL Editor. It creates the table, owner-only row policies and atomic sync function.
2. Enable email authentication.
3. Set **Authentication → URL Configuration → Site URL** to the final deployed URL, and add that exact origin and `http://127.0.0.1:4173` to redirect URLs for testing.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel before the production build. The publishable key is intended for the browser; never put a service-role key in a `VITE_` variable.
5. A grown-up opens “Grown-up corner”, checks the consent box, and requests a sign-in email. After following it on the same browser, the browser's shared journey merges into that account.

Cloud sync stores only the authenticated adult ID, completed activity IDs and update timestamp. Email is handled by Supabase Auth. One account represents one shared journey. Signing out retains local progress. Clearing browser storage clears guest progress. The app reports cloud failures and keeps local progress.

## Deploy to Vercel

Import `nhussain304/kids-maps`, select **Vite**, keep root directory at the repository root, build command `pnpm build`, and output `dist`. Add the two environment variables above and deploy. `vercel.json` includes SPA routing and disables location, camera and microphone access. Once linked, pushes to `main` should trigger deployments.

## Original repository state

At commit `2e70eaf`, the supplied GitHub repository and ZIP contained only `.gitignore`, `LICENSE`, and a CodeQL workflow with no language entry. No React app or Supabase client was present. This implementation adds the application and fills in the workflow's JavaScript language configuration.

## Verification and launch requirements

`pnpm test` checks progress validation, duplicate rewards, merge preservation and journey totals. The production build must pass. Before public launch, verify parent email callback, authenticated cloud save, and isolation between two adult accounts on the actual Supabase project. The SQL migration and auth URL settings require project dashboard access; a publishable key cannot provision them.

License: MIT, original license retained.
