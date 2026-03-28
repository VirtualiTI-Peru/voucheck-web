# Vouchek Web

## Purpose

This project is the web administration portal for Vouchek.

It is intended for organization administrators and verification/accounting users to:

- sign in with Clerk
- review processed receipts
- manage customers and organization members
- trigger organization synchronization with backend data

The web app depends on the backend WebApi for business operations and on Clerk for authentication.

## Stack

- Next.js
- React
- Clerk
- Tailwind CSS

## Environment Variables

Create a local `.env.local` file in this folder.

Required:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key used by the browser
- `CLERK_SECRET_KEY`: Clerk server-side secret key used by server routes
- `CLERK_JWT_TEMPLATE`: Clerk JWT template name used to mint backend-facing tokens
- `API_BASE_URL`: base URL of the Vouchek WebApi, for example `https://localhost:7231`
- `NEXT_PUBLIC_SUPERADMIN_EMAILS`: semicolon-separated superadmin email list

Optional:

- `CLERK_INVITE_BASE_URL`: base URL used in invitation flows
- `RESEND_API_KEY`: required only if this web app is responsible for sending invite emails directly

## Local Development Setup

Prerequisites:

- Node.js 20 LTS or newer
- npm
- running Vouchek backend WebApi
- a Clerk application with the required JWT template and claims

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

This app expects Clerk-issued JWTs to include custom claims used by the backend and portal logic:

- `OrgId`
- `Role`
- `Email`

Expected roles currently used by the backend include:

- `org:transportista`
- `org:verificador`
- `org:sistema`

## Local Verification Checklist

- Sign in through Clerk successfully.
- Load customers from the backend.
- Load receipts from the backend.
- Verify role-based access behavior.
- Confirm `API_BASE_URL` points to the same backend instance used by mobile and desktop during testing.

## Related Services

- Backend API: `../../vouchek-backend/src/WebApi`
- Functions: `../../vouchek-backend/src/Functions`
- Root deployment docs: `../../docs/DEPLOYMENT_STANDARD_OPERATING_PROCEDURE.md`
