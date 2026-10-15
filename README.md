# ORA CRM

Next.js App Router control panel for ORA staff. Staff credentials and sessions are managed by Supabase Auth and are intentionally separate from the ORA mobile player PIN system.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project Connect dialog.
3. Run `npm install` and `npm run dev`.

`SUPABASE_SERVICE_ROLE_KEY` is reserved for future privileged server operations. It must remain server-only and must never use a `NEXT_PUBLIC_` prefix.

## Existing database contract

The application consumes the existing `public.staff_profiles` table. It does not insert, update, or delete staff profiles from the browser.

The existing `auth.users` trigger creates a profile only when signup metadata contains:

```json
{
  "account_type": "staff",
  "first_name": "...",
  "last_name": "...",
  "phone": "..."
}
```

The database assigns `role = 'reception'` and `status = 'pending'`. Role and status never come from the registration form. RLS allows an authenticated staff member to select only their own profile.

## Supabase Auth configuration

In **Authentication → URL Configuration**, configure:

- Development Site URL: `http://localhost:3000`
- Development redirect URLs:
  - `http://localhost:3000/auth/confirm`
  - `http://localhost:3000/reset-password`
- Production redirect URLs:
  - `https://YOUR_CRM_DOMAIN/auth/confirm`
  - `https://YOUR_CRM_DOMAIN/reset-password`

Enable **Confirm email** in the email provider settings. The application signs out any session returned immediately after signup, but mandatory email confirmation must also remain enabled in Supabase.

Use a token-hash compatible confirmation template:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/login">Confirmă adresa de email</a>
```

Use the equivalent recovery template:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Resetează parola</a>
```

Do not hardcode localhost in email templates. `.SiteURL` is controlled by the Supabase Auth URL configuration.

## Production email delivery

Supabase's default mailer is suitable only for limited development testing. Before production, configure custom SMTP in **Authentication → SMTP Settings**. Any SMTP-compatible provider can be used, including Resend, Postmark, SendGrid, or Amazon SES. Keep SMTP credentials in Supabase and never commit them to this repository.

## Access rules

- Unauthenticated users are redirected to `/login`.
- Unverified users cannot enter protected routes.
- `pending` staff are blocked until administrator approval.
- `disabled` staff are blocked.
- Only `active` staff can enter `/dashboard`.
- Authorization reads `role` and `status` from `staff_profiles`, never from user-editable auth metadata.
