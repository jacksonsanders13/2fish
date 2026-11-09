# 2fish

A neighbor-to-neighbor needs board. Post something you need, and people nearby can drop it off at a public spot or buy it from your wishlist.

*A little is enough.*

## Running it locally

```
npm install
npm run dev
```

Then open http://localhost:3000 (and http://localhost:3000/styleguide to see every design token and component).

Without Supabase keys it runs on example data in memory (refreshing resets it).

## Connecting Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/20261109000000_create_needs.sql` in the SQL editor (or `supabase db push`).
3. In **Authentication → Sign In / Providers**, turn on **Allow anonymous sign-ins**. Visitors are signed in quietly in the background so they can post and help without making an account.
4. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key (**Project Settings → API Keys**).
5. Restart `npm run dev`. The preview banner disappears and the feed updates live.

## Design system

All colors, shadows, gradients and animations are tokens in `src/app/globals.css`. Components use them through variants in `src/components/ui`. Read `docs/design-system.md` before changing how anything looks.

## Folders

- `src/app` – pages (feed, post a need, my activity, styleguide)
- `src/components` – the pieces of the UI
- `src/components/ui` – design-system building blocks (Button, Card, Badge, Input…)
- `docs/` – design system guide
- `src/lib` – helpers, categories, example data
- `prototype/` – the original single-file prototype, kept for reference
- `assets/` – logo
