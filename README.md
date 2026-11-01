# MYMANAMENTSYSTEM

SchoolLedger school fee management application. Complete source of the current private Sites deployment, imported into this repository.

## Implemented

- Responsive glass dashboard with student totals, fee collections, outstanding balances, charts, recent admissions, and fee follow-ups.
- Student registration, editing, search, class/section filters, promotion, and fee history.
- Excel `.xlsx` / `.xls` import, column mapping, validation, previews, Student ID upserts, exports, and error reports.
- Monthly invoices, admission fees, additional charges, fixed monthly concessions, full and partial payments, and overpayment protection.
- PDF challans and payment receipts; collection, pending-fee, and other financial reports with Excel/PDF exports.
- PKR currency and an April–March financial year.
- Two empty Super Admin email setup fields with validation and persistent storage.

## Current limitations

The two Super Admin fields save configuration only. Google sign-in, admin username/password login, isolated admin workspaces, offline operation/sync, and automatic monthly tuition-rate increases are **not implemented**. Current-month invoices are generated when the workspace loads; this does not increase the tuition rate or provide unattended scheduled billing. Full financial backup restore, temporary discounts, and late-fee automation are also pending.

The production app currently relies on the owner-private **Sites access gate**. Its shared data endpoints do not implement independent application login or tenant isolation. Do not expose this Worker publicly on another host until authentication and authorization are implemented there. Local development is for loopback use only.

## Stack

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, Cloudflare D1, Drizzle migrations, SheetJS, jsPDF, and Lucide icons. This is a full-stack Worker app, not a static GitHub Pages website.

## Local setup

Use Node.js 22.13+ and the pinned package manager `pnpm@11.25.0`.

```sh
git clone https://github.com/saadcr224-design/MYMANAMENTSYSTEM.git
cd MYMANAMENTSYSTEM
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm build
```

The build produces `dist/server/wrangler.json`. For a fresh local database, apply the migrations once, in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_equal_shen.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_colossal_omega_red.sql
pnpm dev
```

Open the local address printed by the development server. An empty database shows clearly labeled sample data. Choose **Set up my school** to start using real records.

For a built local preview, use `pnpm start` after building and applying migrations. Generated database state is separate from production and excluded from Git.

## Checks

```sh
pnpm exec tsc --noEmit
node tests/api.test.mjs
node tests/access-setup.test.mjs
pnpm build
```

Tests cover a 1,000-student import, ID-based updates, repeat invoice generation, partial/full payments, duplicate-payment and overpayment protection, and account-setup validation. They use an in-memory SQLite database and do not modify production records.

## Project layout

- `app/`: interface, styles, API routes, and Sites authentication helpers.
- `db/` and `drizzle/`: database schema and versioned migrations.
- `worker/`: Cloudflare Worker entry point.
- `components/`, `hooks/`, and `lib/`: UI and integration support.
- `scripts/`: installation, development, build, and Sites integration helpers.
- `tests/`: database/API tests.
- `.openai/hosting.json`: existing Sites deployment identity and database binding.
- `docs/STARTER.md`: retained framework and hosting documentation.

## Deployment and transferred content

The original private deployment remains at https://school-ledger-pkr.saadcr224.chatgpt.site. Uploading the source to GitHub does not move its hosted D1 database, change access permissions, or automatically configure deployment from this repository.

All tracked application source, dependencies/lockfile, migrations, tests, and build configuration are included. Installed dependencies, generated builds, credentials, local caches, and live student/payment data are not committed.

Source snapshot: `6528b43c742d1c40d8c894fd9c3871ff8a9098c0` from the existing Sites source repository. The destination repository's existing license is retained; bundled third-party notices remain alongside their files.
