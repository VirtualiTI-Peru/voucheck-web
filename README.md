# Vouchek Web

## Purpose

This project is the receipts web portal for Vouchek.

Current scope is intentionally reduced to:

- sign in with Supabase
- view receipt pages and summaries
- consume customer access from UniversalAuth metadata (`virtualiti` claims in user metadata)

User and invitation management screens/routes were removed from this app.

## Stack

- Next.js
- React
- Supabase JS
- Tailwind CSS

## Environment Variables

Use `.env.local` for local development and App Service application settings in cloud environments.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase key used by server routes
- `NEXT_PUBLIC_VIRTUALITI_APP_ID`: UniversalAuth application id used to resolve allowed customers
- `API_BASE_URL`: base URL of the Vouchek WebApi, for example `https://localhost:7231`
- `UNIVERSALAUTH_API_BASE_URL`: base URL of UniversalAuth API used for delegated password reset requests

Optional:

- `NEXT_PUBLIC_RECEIPTS_PAGE_SIZE`: initial receipts page size used by the UI
- `RECEIPTS_PAGE_SIZE`: server-side receipts page size fallback
- `NEXT_PUBLIC_RECEIPTS_POLL_MS`: client polling interval in ms
- `RECEIPTS_CACHE_TTL_SECONDS`: server-side receipts page cache TTL in seconds, default `30`
- `RECEIPTS_SUMMARY_CACHE_TTL_SECONDS`: receipts summary polling cache TTL in seconds, default `5`
- `RECEIPTS_SUMMARY_BY_DATE_CACHE_TTL_SECONDS`: date summary polling cache TTL in seconds, default `5`

## Local Development Setup

Prerequisites:

- Node.js 20 LTS or newer
- npm
- running Vouchek backend WebApi
- a Supabase project with UniversalAuth `virtualiti` metadata populated for app/customer access

Steps:

1. Create `.env.local` with the variables listed above.
2. Install dependencies.
3. Start the development server.

```bash
npm install
npm run dev
```

The app will usually run on `http://localhost:3000`.

## Authentication Assumptions

This app expects Supabase users to include `user_metadata.virtualiti` with at least:

- `applications[]` entries containing `application_id`, `application_name`, and customer memberships
- customer entries used to derive allowed customer ids for receipts access

The app uses `NEXT_PUBLIC_VIRTUALITI_APP_ID` to select the correct application membership.

Expected roles currently used by the receipts portal include:

- `org:verificador`
- `org:admin`
- `org:sistema`

## Local Verification Checklist

- Sign in through Supabase successfully.
- Verify `/dashboard` and `/receipts` render after authentication.
- Confirm receipts API endpoints return data only for allowed customers.
- Verify role-based access behavior for receipts surfaces.
- Confirm `API_BASE_URL` points to the same backend instance used by mobile and desktop during testing.

## Related Services

- Backend API: `../../vouchek-backend/src/WebApi`
- Functions: `../../vouchek-backend/src/Functions`
- Root deployment docs: `../../docs/DEPLOYMENT_STANDARD_OPERATING_PROCEDURE.md`
