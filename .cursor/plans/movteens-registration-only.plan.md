# MovTeens: strip to registration-only

**Created:** 2026-08-03
**Status:** Planned

## Problem Statement

Adapt the copied camp project to keep only the public registration flow (form + payment) plus a bare registration list for admins. Remove hero/landing sections, the EBD module, the admin UI shell (sidebar/header/staff), and all notification triggers (payment webhook + confirmation emails).

## Reuse audit

- Registration flow (`app/(site)/registration/page.tsx`, `components/registration/*`, `components/payment/*`) already exists and is self-contained — reuse as-is.
- Registration list (`app/admin/page.tsx`) already fetches from `GET /api/registration` and calls `POST /api/registration/confirm` — keep, minus admin shell.
- Decision: **Reuse** the existing pages; **delete** unused modules. No new helpers introduced.

## Scope — Delete

### Hero / landing sections
- `components/camping/` (hero-section, event-highlights, speaker-section, pricing-section, contact-section, registration-cta, footer)
- `public/hero-background.jpg`, `public/movteens-logo.png` (verify no remaining references first)

### EBD module
- `app/ebd/` (page, layout, error)
- `app/api/ebd/` (attendance, reports, students)
- `components/ebd/` (7 files)
- `lib/ebd/`, `lib/validation/ebd-schema.ts`
- `shared/models/ebd-attendance.model.ts`, `shared/models/ebd-student.model.ts`, `shared/ebd.interface.ts`

### Admin UI (keep only the registration list)
- Delete: `app/admin/staff/`, `app/staff/`, `components/staff/`
- Delete: `components/admin/admin-sidebar.tsx`, `admin-install-banner.tsx`, `admin-theme-provider.tsx`, `register-sw.tsx` (whatever `AdminAuthShell` does not need)
- Keep: `app/admin/page.tsx` (Inscrições list), `app/admin/login/`, `app/api/admin-login/`, `components/admin/admin-auth-shell.tsx`, `admin-logo-mark.tsx`, `lib/admin-session.ts`, `lib/admin-metadata.ts`
- Simplify `app/admin/layout.tsx` / `AdminAuthShell` so the list renders with **no navbar/header/sidebar** (just auth gate + page content)

### Notification triggers
- Delete `app/api/payment/notification/route.ts` (PagSeguro webhook)
- Remove nodemailer/juice email sending from `app/api/registration/confirm/route.ts` (keep the confirm logic + `ADMIN_PASS` check)
- Delete `lib/confirmation-email-template.ts`
- Remove `nodemailer`, `juice`, `@types/nodemailer` from `package.json`

## Scope — Change

### Homepage redirects to registration
`app/(site)/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/registration");
}
```

- Check `RegistrationClosed`/`PaymentCompletedScreen` usage that lived on the home page: payment-completed screen is reached via `?paymentCompleted` on `/` — move that handling to the registration page or point the payment return URL to `/registration?paymentCompleted=true` (check `services/payment.ts` / `app/api/payment/checkout/route.ts` for the redirect URL).

### Admin button on the form
Add a discreet footer link under the form in `app/(site)/registration/page.tsx`:

```tsx
<div className="mt-8 text-center">
  <a href="/admin" className="text-xs text-muted-foreground hover:text-foreground">
    Área administrativa
  </a>
</div>
```

### Metadata cleanup
- `app/layout.tsx`: title/description reflect registration-only site; remove `appleWebApp` admin title.
- `app/manifest.ts`: rename (no longer "MovTeens Admin"), update `start_url`, remove EBD mention in description.
- `app/sw.ts` / `public/sw.js`: remove if only used by the deleted admin install banner.

## Files kept (registration core)

- `app/(site)/registration/page.tsx`, `app/(site)/layout.tsx`
- `components/registration/*`, `components/payment/*`
- `app/api/registration/route.ts`, `app/api/registration/confirm/route.ts`, `app/api/registration/export/route.ts`
- `app/api/payment/checkout/route.ts`
- `services/registration.ts`, `services/payment.ts`, `lib/mongoose-connection.ts`, `lib/registration-config.ts`, `lib/validation/registration-schema.ts`, `shared/registration.interface.ts`, `shared/models/registration.model.ts`, `hooks/use-registration-form.ts`

## Success criteria

- `/` redirects to `/registration`; form → payment flow works end to end
- No hero/EBD/admin-shell code remains; build passes (`npm run build` / lint) with no dangling imports
- `/admin` shows only the Inscrições list behind login, no sidebar/header
- No payment webhook route and no email sending anywhere

## Rollback plan

All deletions are in git history of the copied project; restore via `git checkout` if needed.
