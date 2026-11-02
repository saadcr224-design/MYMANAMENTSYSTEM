# SchoolLedger — Next.js + Supabase

Glassy school fee management dashboard, deployable on Vercel with Node 22.

## Deploy

Import this repository in Vercel. Framework: Next.js. Root directory: repository root.
The checked-in vercel.json runs `npm ci --ignore-scripts` and `npm run build`.
Set these server environment variables for the intended deployment:
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY (publishable/anon key only; no service-role key needed)

Run `sql/schema.sql` once in an empty Supabase project. The connected project already has this schema; do not rerun CREATE statements there.

## School admin login

1. Open Supabase Authentication → Users → Add user. Create an email/password user and confirm the email. Do not share passwords in chat or commit them.
2. In Supabase SQL Editor grant that user's UUID access:
   `insert into public.sl_members(user_id) values ('UUID-FROM-AUTH-USERS');`
3. Sign in to the application using that email and password.

Each provisioned user has a separate ledger. There is no public sign-up in the application, no default password, and no privileged API key in the frontend. Memberships can only be granted by the database administrator. Remove membership to revoke app access. Sessions last at most one hour; sign in again when expired.

## Included

Students, Excel import/column mapping/upsert by student ID, fee generation, payment recording, remaining balances, printable PDF downloads, fee structures, discounts, reports, settings and JSON backup export. New workspaces start empty. Existing Cloudflare records are NOT automatically migrated.

Financial writes use optimistic database versions: concurrent edits are rejected with a reload/retry message instead of silently overwriting another edit. Payments are stored in integer paisa. Historical invoices retain their billed rates. The current month's invoices are generated on an authenticated data load; prior months can be generated explicitly.

## Current limits

Admin creation from inside the application, offline write/sync, scheduled background invoice generation, automatic fee-rate increases and backup restore are not implemented. Google authentication and its setup screen have been removed from the application. This deployment does not claim those features are active.

A ledger is stored as one versioned JSON document per admin. This simplifies atomic writes and tenant isolation, but large multi-user school deployments should split invoices/payments into normalized tables and add pagination before scaling. Administrators control their own ledger via RLS; the server validates normal UI writes.

## Development

Node 22: `npm ci --ignore-scripts`, copy `.env.example` to `.env.local`, configure Supabase, then `npm run dev`.
`npm test` runs payment/import invariant tests. `npm run build` produces a standard Next.js build.

The former Cloudflare Worker, D1, Vinext and Sites build scripts have been removed. The earlier Sites app remains separately hosted and its data has not been modified.
