# OneCodeLabs Ticketing System

A lightweight ticketing app. Admins create projects, clients raise tickets with a
priority (Low/Mid/High), details, and screenshots. Devs work a priority-sorted
queue and reply. Everyone gets notified in-app and by email.

**Stack:** Next.js · Supabase (Postgres + Auth + Storage) · Prisma · Tailwind CSS
**Hosting:** Vercel + Supabase — free to start.

---

## Setup (first time only)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your environment variables
```bash
cp .env.example .env.local
cp .env.local .env
```
Open both `.env.local` and `.env` and fill in your real values:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase → Project Settings → API
- `DATABASE_URL` / `DIRECT_URL` — from Supabase → Connect → ORM → Prisma (remember to swap in your real database password)
- `RESEND_API_KEY` / `NOTIFY_FROM_EMAIL` / `COMPANY_NOTIFICATION_EMAIL` — from resend.com (optional, ticket creation works without it)

### 3. Push the database schema
```bash
npm run db:push
```

### 4. Create a storage bucket for screenshots
In Supabase: **Storage → New bucket** → name it `attachments` → toggle **Public bucket** ON.

Then add this upload policy in Supabase **SQL Editor**:
```sql
create policy "Authenticated users can upload attachments"
on storage.objects for insert
to authenticated
with check (bucket_id = 'attachments');
```

### 5. Run it locally
```bash
npm run dev
```
Open http://localhost:3000

### 6. Make yourself admin
- Sign up in the app with your own email
- Log in once (this creates your user record)
- Run:
```bash
  npm run promote your@email.com ADMIN
```
- Refresh the page — you're now admin

---

## Using the app

- **Admin:** create projects, go to **Users** (top nav) to set anyone's role
  (Client/Dev/Admin) and which project(s) they belong to. People must sign up
  once before they appear in that list.
- **Client:** submit tickets with a priority and screenshots, reply, reopen if needed.
- **Dev:** work the priority-sorted queue, update status, reply, leave internal notes.
- **Notifications:** bell icon (top right) — admins/devs get notified when a client
  opens a ticket; clients get notified when their ticket is resolved. Same events
  also send an email if Resend is configured.

---

## Deploying changes

Once your project is live on Vercel (connected to your GitHub repo), every push
to `main` auto-deploys — no manual steps on Vercel's side.

**Quick deploy — one command:**
```bash
bash deploy.sh
```
This stages, commits, and pushes your changes. Vercel picks it up automatically
and rebuilds within about a minute. Check progress at vercel.com → your project → Deployments.

**`deploy.sh`** (already included in this repo):
```bash
#!/bin/bash
git add -A
git commit -m "Update $(date +%Y-%m-%d_%H:%M)"
git push
echo "Pushed. Vercel is now building — check https://vercel.com/dashboard"
```

**One thing this script does NOT do:** update your live database. If you changed
`prisma/schema.prisma`, run this locally first, before deploying:
```bash
npm run db:push
```

---

## First-time Vercel setup (only needed once)

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to vercel.com → **Add New → Project** → import your GitHub repo.
3. Add all the same environment variables from your `.env.local` under
   **Settings → Environment Variables** — set them for **Production**.
   Important: leave "Sensitive" **unchecked** for `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` — marking these Sensitive breaks the app's
   middleware, since it can't read Sensitive variables.
4. Deploy. Once live, add one more variable:
```
   NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
```
   then redeploy once (`bash deploy.sh` with any small change, or use Vercel's
   Redeploy button on the deployment page).

---

## Project structure
```
app/
  login/page.tsx                 sign in / sign up
  dashboard/
    admin/page.tsx                admin: project list
    admin/users/page.tsx          admin: manage everyone's roles + projects
    admin/projects/[id]/page.tsx  admin: project detail, members, tickets
    dev/page.tsx                  dev: priority queue
    client/page.tsx                client: their tickets
    client/new/page.tsx            client: new ticket form
  tickets/[id]/page.tsx           shared ticket detail + comments
  api/                            all backend routes (projects, tickets, users, notifications)
components/                       Navbar, badges, forms, ticket list, notification bell
lib/                              Supabase clients, Prisma client, auth helper, email helper
prisma/schema.prisma              full data model
scripts/promote.ts                CLI to promote a user's role
deploy.sh                         one-command deploy script
middleware.ts                     session refresh + route protection
```