# MineVault

**Keep the stories behind your Minecraft worlds.**

MineVault is a private Minecraft world journal, screenshot gallery, and achievement memory vault. The project currently includes a Next.js web application and an early **Java Edition 1.21.1 Fabric capture mod**.

## Capture-first beta 0.1

The beta is **free**, and has no payment gateway. A Minecraft advancement queues a small on-screen prompt:

- **J: Save Moment** takes a screenshot and saves a local JSON manifest, with the moment's achievement, player name, event time, screenshot time, XYZ, dimension, Minecraft day, camera perspective, and available online-player names.
- **K: Skip** dismisses the prompt without saving a screenshot or file.
- Captures remain in `.minecraft/minevault/captures/` on your device.
- In MineVault's web journal, open a world, choose Add Memory and import the matching `.json` and `.png` files together.

**[Download the compiled beta mod from GitHub Actions](https://github.com/zach1241/minevault/actions/runs/39243642299)** | **[Full installation guide](docs/BETA.md)** | **[Web beta setup screen](app/beta/page.tsx)**

### Important limitations

This is an early **local export/import** beta, not automatic cloud syncing. The PNG captures the scene **when Save is pressed**. The metadata records coordinates and time at the advancement event. The mod requires manual in-game testing before general public distribution. The Java Edition beta does not support Bedrock, triple-camera replay, AI video editing, or paid subscriptions.

The Next.js web app offers a demo mode, but its guest changes last only for that session. Persistent private storage requires a dedicated Supabase project with the SQL migration applied and browser environment variables configured. A hosted beta URL has not yet been confirmed.

## Tech

- Web: Next.js, TypeScript, React, Tailwind, Playwright
- Storage and authentication: Supabase Auth, Postgres RLS and private buckets
- Minecraft capture: Fabric client mod (Java 21, Minecraft 1.21.1)
- Verification: GitHub Actions for web tests and mod builds

## Local web development

```sh
npm ci
npm run dev
```

For persistent storage, copy `.env.example` to `.env.local`, configure a MineVault-specific Supabase instance, and apply migrations in `supabase/migrations`. Never commit private keys.

```sh
npm run typecheck
npm run build
npx playwright test
```

To compile the mod with Java 21 and Gradle 8.10.2:

```sh
cd minecraft-mod
gradle build
```

## Privacy

No capture data leaves Minecraft automatically. Importing into the web journal is a deliberate user action. Manifests can reveal coordinates, friends' names and server information; keep them private unless you decide to share. There is no paid tier or video recording in beta 0.1.
