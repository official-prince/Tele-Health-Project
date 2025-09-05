CareLink Health — Website Overview

Summary

CareLink Health is a telehealth platform built with React (Vite) frontend and an Express + TypeScript demo backend. It supports three user roles: patients, doctors, and admins. Patients self-register and use the Patient Portal for booking, video visits, prescriptions, records, and payments. Doctors’ accounts are created by admins via the Admin Portal and then manage availability, consultations, and earnings. Admins manage users, verify doctor licenses, and operate finance/content/support workflows.

Primary User Flows

- Public landing: hero, features, how-it-works, testimonials, CTA to sign up/login.
- Patient signup/login → main landing /patient (dashboard) → search doctors, book/reschedule appointments, join video visits, view prescriptions and records, upload documents, payments & invoices, support tickets.
- Admin login → /admin (operations) → create doctor accounts, approve/reject doctor licenses, manage appointments, refunds, plans, announcements, tickets, and security settings.
- Doctor login → /doctor (doctor portal) → receive appointment notifications, host consultations (video placeholder), chat, upload files, issue e-prescriptions (basic e-sign), view earnings and payouts.

Core Features Implemented

- Authentication: in-memory demo auth with seeded admin and demo doctor. Public signup creates patient accounts.
- Admin flows: create doctor accounts endpoint (POST /api/admin/doctors) — creates in-memory user and profile, optionally creates Supabase Auth user and inserts a doctor row when SUPABASE credentials exist.
- Doctor features: profile & license upload endpoint (/api/doctor/me/license), profile editing, notifications, calendar view, consultation UI (meeting creation placeholder), messaging, prescriptions, earnings reports & CSV export, in-memory payouts endpoint.
- Patient features: dashboard, doctors search/filter, bookings (POST /api/appointments), appointments list, upload medical records, prescriptions list, support tickets.
- Public landing page with CTA and smooth scrolling.

Key Files & Locations

- client/pages/Index.tsx — public landing page
- client/pages/Patient.tsx — Patient Portal (landing for patient role)
- client/pages/Doctor.tsx — Doctor Portal (landing for doctor role)
- client/pages/Admin.tsx — Admin Portal
- client/components/PatientSidebar.tsx, DoctorSidebar.tsx — side navigation
- client/components/CreateDoctorForm.tsx — Admin create-doctor UI
- server/routes/auth.ts — demo auth, sessions, seed users
- server/routes/admin.ts — admin APIs (createDoctor added)
- server/routes/doctor.ts — doctor APIs (profile, license upload, earnings, notifications)
- server/routes/appointments.ts — appointment APIs, messaging, file uploads, meeting & prescription signing placeholders
- server/lib/supabase.ts — helper to create Supabase server client
- config/credentials.env.template — credential template for external services

Data & Storage

- Demo app uses in-memory Maps and arrays for users, sessions, profiles, appointments, and payouts.
- Optional Supabase integration: when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided, server will attempt to use Supabase for auth and persistent tables (appointments, doctors). Put credentials in config/credentials.env.template or connect via MCP.

External Integrations (placeholders)

- Supabase: auth, storage, DB (credentials required to enable). File upload endpoints support Supabase Storage when configured.
- Twilio / WebRTC: meeting creation is a placeholder; replace with Twilio/Jitsi implementation and server-side tokens.
- Stripe: payouts & payments UI exists but is in-memory; integrate Stripe for real payment flows.
- E-sign providers: basic e-sign fields exist for prescriptions; integrate DocuSign/HelloSign for legal signatures.

How to Run (dev)

- Use the project dev server in the environment (already running in your Builder preview). Locally: npm install, npm run dev (follow package.json scripts).
- Provide env values by copying config/credentials.env.template → .env and filling keys, or connect Supabase via MCP.

Where to customize

- UI/content: client/pages and client/components. Tailwind + existing UI primitives.
- API logic: server/routes/* (auth.ts, admin.ts, doctor.ts, appointments.ts).
- DB schema: when using Supabase, create tables: users (managed by Supabase Auth), doctors, appointments with fields matching shared/api.ts interfaces.

Next recommended steps

1. Connect Supabase (via MCP or env) and run migrations / create required tables (doctors, appointments).
2. Wire createDoctor to use Supabase fully; optionally send email invites to doctors.
3. Integrate Twilio (or chosen video provider) for meetings and Twilio Verify for 2FA.
4. Integrate Stripe for payments and payouts (connect accounts if applicable).
5. Add persistent storage for uploaded files and ensure security (private buckets, signed URLs).

Open tasks and TODOs

- Replace in-memory stores with DB-backed models (Supabase/Neon/Prisma)
- Implement production-ready auth, password reset, email verification, and 2FA
- Implement legal e-signature provider for prescriptions
- Add unit/integration tests and typecheck CI
- Harden security, rate-limiting, logging, and monitoring (Sentry)

Contact & MCP suggestions

Recommended MCPs to connect: Supabase, Neon (if using Postgres), Stripe, Twilio, Netlify/Vercel for hosting, Sentry for errors, and Builder.io for CMS. Use the MCP popover to connect them.

---
Generated on: 
