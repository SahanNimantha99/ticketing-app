# Ticketing System

A lightweight client ticketing app. Company admins create projects, clients raise
tickets with a priority (Low/Mid/High), details, and screenshots, and developers
work a priority-sorted queue and reply on each ticket.

**Stack:** Next.js (App Router) · Supabase (Postgres + Auth + Storage) · Prisma · Tailwind CSS
**Hosting:** Vercel (app) + Supabase (database/auth/storage) — free to start, ~$0-45/mo at real usage.

---

## 1. What's included

- **Branding:** OneCodeLabs logo and gold color palette throughout
- **Roles:** Admin, Dev, Client (stored per-user, default role on signup is Client)
- **Admin:** create projects, manage all users' roles and project assignments from one page (`/dashboard/admin/users`), see all tickets
- **Dev:** priority-sorted ticket queue, assign/update status & priority, reply, internal notes
- **Client:** create tickets with screenshots, reply, reopen resolved tickets
- Ticket lifecycle: `OPEN → ASSIGNED → IN_PROGRESS → IN_REVIEW → RESOLVED → CLOSED` (reopenable)
- Comment thread per ticket, with internal-only notes hidden from clients
- **In-app notifications** (bell icon, top right): admins/devs on a project are notified when a client opens a ticket; the client is notified when their ticket is marked resolved
- **Email notifications** (via Resend, optional): admins/devs on a project get an email when a client opens a ticket

---

## 2. One-time setup

### 2.1 Create a Supabase project
1. Go to https://supabase.com → New project. Pick a region close to your users.
2. Save the database password you set — you'll need it for the connection string.

### 2.2 Get your API keys
In the Supabase dashboard: **Project Settings → API**
- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.3 Get your database connection strings
**Project Settings → Database → Connection string**
- Copy the **Transaction pooler** string (port `6543`) → this is `DATABASE_URL`
- Copy the **Session/direct** string (port `5432`) → this is `DIRECT_URL`
- Replace `[YOUR-PASSWORD]` in both with the password from step 2.1

### 2.4 Turn off email confirmation (optional, for faster testing)
**Authentication → Providers → Email** → toggle off "Confirm email" if you want
new signups to log in immediately without clicking an email link. (Leave it on for
production if you want verified emails.)

### 2.5 Create the storage bucket for screenshots
**Storage → New bucket**
- Name: `attachments`
- Toggle **Public bucket** ON (so uploaded screenshots can be viewed via a direct URL)
- Create it.

### 2.6 Set up email notifications (Resend)
So your team gets an email whenever a client opens a new ticket.

1. Go to https://resend.com → sign up (free tier: 3,000 emails/month, no card needed).
2. **API Keys** → create one → this is `RESEND_API_KEY`.
3. **Domains** → add and verify your sending domain (add the DNS records it gives
   you). Until a domain is verified, Resend only lets you send to your own signup
   email — fine for testing, not for real use.
4. Set `NOTIFY_FROM_EMAIL` to an address on that verified domain, e.g.
   `Ticketing <notifications@yourcompany.com>`.
5. Set `COMPANY_NOTIFICATION_EMAIL` as a fallback inbox — it's only used if no
   admin/dev accounts exist yet. Once you have admins/devs in the app, they're
   notified automatically instead (no extra config needed).

Skip this section entirely if you don't want emails yet — ticket creation works
fine either way; you'll just rely on checking the dashboard.

### 2.7 Configure environment variables
```bash
cp .env.example .env.local
```
Fill in the values from steps 2.2, 2.3, and 2.6.

### 2.8 Install dependencies and push the schema
```bash
npm install
npm run db:push
```
`db:push` creates all tables (User, Project, Ticket, Comment, Attachment, etc.) in
your Supabase Postgres database based on `prisma/schema.prisma`.

### 2.9 Run it locally
```bash
npm run dev
```
Open http://localhost:3000 — you'll land on the login page.

---

## 3. Creating your first admin user

Roles can't be picked at signup on purpose (so random signups can't make themselves
admin). The flow:

1. On the login page, use "New client? Create an account" to sign up with your own email.
2. Log in once — this creates your `User` row in the database (defaulted to `CLIENT`).
3. Promote yourself to admin:
   ```bash
   npm run promote your@email.com ADMIN
   ```
4. Log out and back in (or just refresh) — you'll now land on the admin dashboard.

Repeat steps 1-2 for each developer, then promote them with `DEV` instead of `ADMIN`.
Clients just sign up and stay as `CLIENT` — no promotion needed.

**As admin:**
- Create a project.
- Go to **Users** (top nav) to see everyone who has signed up. Set each person's
  role (Client/Dev/Admin) and which project(s) they belong to — all from one page.
  People must sign up once before they show up in this list.
- Clients only see projects they're assigned to, and can submit tickets into them.

---

## 4. Deploying (Vercel + Supabase)

Supabase is already hosted from step 2 — nothing more to do there. To deploy the app:

1. Push this project to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. In the "Environment Variables" step, add the same keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `COMPANY_NOTIFICATION_EMAIL` (if using email)
   - `NEXT_PUBLIC_APP_URL` — set this to your Vercel URL once you have it (you can
     add it after the first deploy, then redeploy)
4. Deploy. Vercel runs `npm install` (which runs `prisma generate` automatically via
   `postinstall`) and `npm run build`.
5. Once live, visit your Vercel URL, sign up, and promote yourself to admin the same
   way as step 3 above — run `npm run promote` from your local machine (it points at
   the same Supabase database, so it works whether you signed up locally or on the
   deployed site).

Every future `git push` to your main branch auto-redeploys. No servers, containers,
or CI config to maintain.

---

## 5. Updating the app later

- **Add a field to a ticket/project/etc:** edit `prisma/schema.prisma`, then run
  `npx prisma db push` (fine for a solo/small team) or switch to `prisma migrate dev`
  if you want versioned migrations. Prisma types update automatically on the next
  `npm run dev`/`build`.
- **Change roles or permissions:** logic lives in the API routes under `app/api/`
  and in `lib/auth.ts` — each route checks `user.role` explicitly.
- **Change the ticket lifecycle:** edit the `Status` enum in `prisma/schema.prisma`
  and the dropdown list in `components/TicketControls.tsx`.
- **Styling:** plain Tailwind utility classes throughout — no theme system to fight.

---

## 6. Cost at a glance

| Usage | Cost |
|---|---|
| Solo/small team, a few projects | $0/mo (Vercel + Supabase free tiers) |
| Growing usage (more storage, more DB rows, more bandwidth) | ~$20-45/mo (Vercel Pro + Supabase Pro) |

No separate email or file-storage bill — both are covered by Supabase.

---

## 7. Project structure

```
app/
  login/page.tsx                 sign in / sign up
  dashboard/
    admin/page.tsx                admin: project list
    admin/projects/[id]/page.tsx  admin: project detail, members, tickets
    dev/page.tsx                  dev: priority queue
    client/page.tsx               client: their tickets
    client/new/page.tsx           client: new ticket form
  tickets/[id]/page.tsx           shared ticket detail + comments
  api/
    projects/route.ts             list/create projects
    projects/[id]/members/route.ts add a member
    tickets/route.ts              list/create tickets
    tickets/[id]/route.ts         get/update a ticket
    tickets/[id]/comments/route.ts add a reply
  actions.ts                      sign in/up/out server actions
components/                       Navbar, badges, forms, ticket list, controls
lib/
  supabase/client.ts, server.ts   Supabase SDK setup (browser & server)
  auth.ts                         getCurrentUser() — syncs Supabase auth -> our User table
  prisma.ts                       Prisma client singleton
prisma/schema.prisma              full data model
scripts/promote.ts                CLI to promote a user's role
middleware.ts                     session refresh + route protection
```

## 8. Known limitations (intentional, for a lightweight v1)

- No email/push notifications yet — reload the page to see updates. Adding email is
  a good next step (Resend integrates in an afternoon) if you want it.
- No SLA timers or reporting dashboards — the schema supports adding these later
  without a redesign.
- Admin adds project members by email; there's no invite-by-link flow yet.
