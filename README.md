# 2fish

A neighborhood giving board. People post one specific thing they need (size 4 diapers, a winter coat, groceries for the week). Neighbors nearby hand it off at a public place or buy it from a wishlist so the store ships it. Free, private, no money through the site.

*A little is enough.* · [join2fish.com](https://join2fish.com)

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 + shadcn/ui · Supabase (Postgres, Auth, Storage, Realtime) · Resend (email, optional) · Vercel.

## Running it locally (Windows / PowerShell)

You need [Node.js](https://nodejs.org) 20 or newer and [Git](https://git-scm.com). Everything below runs in PowerShell from the project folder.

### 1. Install

```powershell
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, click **New project**. Pick any name, set a database password (save it), choose the region closest to you (US East for Raleigh).
2. When it finishes, open **Project Settings → API**. You'll need three things from this page: the **Project URL**, the **anon / publishable** key, and the **service_role / secret** key.

### 3. Environment variables

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from step 2. Leave `NEXT_PUBLIC_SITE_URL` as `http://localhost:3000` for now. Save and close.

`.env.local` is ignored by git. Never commit it.

### 4. Run the database migrations

The schema, security policies and storage buckets live in `supabase/migrations/`. Two ways to apply them:

**Option A: Supabase CLI (recommended, repeatable)**

```powershell
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

Your project ref is the part of the Project URL before `.supabase.co`. `db push` applies every migration in order and remembers which ones ran.

**Option B: paste into the SQL editor**

In the Supabase dashboard open **SQL Editor → New query**. Paste the contents of `supabase/migrations/0001_schema.sql`, click **Run**. Repeat for `0002_rls.sql` and `0003_storage.sql`, in that order.

### 5. Configure auth in Supabase

In the dashboard, **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/auth/callback`

Email + password and magic links work out of the box. For Google sign-in, see *Manual setup* below.

### 6. Demo data (optional, local only)

`supabase/seed.sql` creates four neighbors (all with the password `password123`) and six needs around Raleigh. Paste it into the SQL editor and run it. Don't run it on a production project.

### 7. Start the app

```powershell
npm run dev
```

Open <http://localhost:3000>. Create an account, confirm the email (check spam; Supabase's built-in mailer is slow and limited to a few per hour), finish onboarding with a ZIP, and you're on the board.

### 8. Make yourself an admin

In the SQL editor:

```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```

Then `/admin` shows reports.

## Other commands

```powershell
npm run build       # production build (must pass before deploying)
npm run lint        # eslint
npm run typecheck   # tsc
npm test            # unit tests + database/RLS tests (runs Postgres in memory, no Supabase needed)
```

## Manual setup for production

### Google sign-in

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project → **APIs & Services → OAuth consent screen** → External → fill in app name, support email, and add `join2fish.com` as an authorized domain → save.
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   - Authorized JavaScript origins: `https://YOUR-PROJECT-REF.supabase.co`
   - Authorized redirect URIs: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.
4. Supabase dashboard → **Authentication → Providers → Google** → enable, paste both, save.

### Email with Resend

The app works without email (in-app notifications always show). To also send email:

1. [resend.com](https://resend.com) → sign up → **Domains → Add domain** → `join2fish.com`.
2. Resend shows DNS records (a DKIM `TXT`, plus `MX` and `TXT` for bounces). Add them at wherever `join2fish.com` is registered. Click **Verify** once they propagate (usually under an hour).
3. **API Keys → Create** → copy the key.
4. Set `RESEND_API_KEY` and `RESEND_FROM="2fish <hello@join2fish.com>"` in `.env.local` and in Vercel.

Until the domain is verified you can test with `RESEND_FROM="2fish <onboarding@resend.dev>"`, which only delivers to your own Resend account email.

### Deploy to Vercel

1. Push the repo to GitHub (already done if you're reading this there).
2. [vercel.com/new](https://vercel.com/new) → import the repo. Framework is detected as Next.js.
3. **Environment variables:** add every key from `.env.local`, but set `NEXT_PUBLIC_SITE_URL=https://join2fish.com`.
4. Deploy. Then **Settings → Domains** → add `join2fish.com` and `www.join2fish.com`. Vercel shows the DNS records to set at your registrar.
5. Add `jointwofish.com` too and choose **Redirect to join2fish.com** (308).
6. Back in Supabase **Authentication → URL Configuration**: set Site URL to `https://join2fish.com` and add `https://join2fish.com/auth/callback` to Redirect URLs.

### Supabase email templates (recommended)

Supabase's default auth emails are plain. In **Authentication → Email Templates** you can reword them. Keep the `{{ .ConfirmationURL }}` link; the app handles it at `/auth/callback`.

## Project layout

```
src/app/              pages and route handlers
  (auth)/             sign in, sign up, reset password, check email
  needs/              browse, post, view, edit
  messages/           inbox and threads (realtime)
  dashboard/          my needs, helping with, inbox
  settings/           profile, account, blocked people, your data
  admin/              reports queue
  api/account/        export (JSON) and delete (service role)
src/components/       UI (ui/ is shadcn)
src/lib/              server actions, queries, validation, supabase clients
src/data/             ZIP → rounded center point (US Census, public domain)
supabase/migrations/  schema, RLS, storage policies
supabase/seed.sql     demo data for local dev
tests/                vitest: unit tests + RLS tests on in-memory Postgres
```

## Privacy, in one paragraph

We never store addresses. A ZIP code becomes a map point rounded to about a kilometer, and that's all that's kept. Posts show "~2 mi away". Meeting spots are only shared in private messages. Every table has row level security; status changes (offer, cancel, fulfilled) go through database functions that check who's calling. Account deletion runs server-side with the service role key and removes the auth user, profile, needs, photos and the person's side of conversations.
