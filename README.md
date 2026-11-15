# 2fish

AI growth consultant for small local businesses. Phase 2: the audit is real, the plan is saved to Supabase, and sign-in is a magic link.

## Run it

Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable key (both are in the Supabase dashboard under Project Settings → API). `ANTHROPIC_API_KEY` is optional.

```
npm install
npm run dev
```

Open http://localhost:3000. Take the audit, see results, save the plan with your email, and it shows up on `/dashboard`.

Live mockup: https://2fish-flyert.vercel.app

Design decisions are in `DESIGN.md`. Project rules are in `CLAUDE.md`.
