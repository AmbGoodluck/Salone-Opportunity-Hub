-- ============================================================
-- Salone Opportunity Hub - Supabase Email Templates
-- ============================================================
--
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Email Templates
-- 3. Paste the corresponding HTML into each template type
-- 4. Save changes
--
-- Alternatively, you can set templates via the Supabase Management API.
--
-- IMPORTANT SPAM-PREVENTION TIPS:
-- ---------------------------------------------------------------
-- 1. Set up a custom SMTP provider (e.g. Resend, Postmark, SendGrid)
--    Dashboard > Project Settings > Authentication > SMTP Settings
--    The default Supabase SMTP has low sending limits and poor deliverability.
--
-- 2. Add these DNS records for your domain (saloneopportunities.org):
--    - SPF:  TXT record  "v=spf1 include:<your-smtp-provider> ~all"
--    - DKIM: TXT record  (provided by your SMTP provider)
--    - DMARC: TXT record "_dmarc" -> "v=DMARC1; p=quarantine; rua=mailto:admin@saloneopportunities.org"
--
-- 3. Set the "Sender Name" and "Sender Email" in Dashboard > Authentication > SMTP:
--    Name:  Salone Opportunity Hub
--    Email: noreply@saloneopportunities.org
--
-- 4. Keep the email simple, avoid excessive images/links, and include
--    a plain-text version (Supabase auto-generates this from HTML).
-- ============================================================


-- ============================================================
-- TEMPLATE 1: Confirm Signup
-- ============================================================
-- Supabase template variable: {{ .ConfirmationURL }}
-- Go to: Authentication > Email Templates > Confirm signup
-- Paste the HTML below into the "Body" field.
-- Set Subject to: Welcome to Salone Opportunity Hub - Confirm Your Email
-- ============================================================

/*
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1d4ed8; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                SALONE OPPORTUNITY HUB
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px; color:#1e293b; font-size:20px; font-weight:700;">
                Confirm Your Signup
              </h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                Thank you for joining Salone Opportunity Hub! Click the button below to verify your email address and activate your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:8px; background-color:#1d4ed8;">
                    <a href="{{ .ConfirmationURL }}"
                       target="_blank"
                       style="display:inline-block; padding:14px 36px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Confirm Your Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#64748b; font-size:13px; line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 32px; word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#1d4ed8; font-size:13px; text-decoration:underline;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 24px;" />

              <p style="margin:0 0 6px; color:#475569; font-size:14px; font-weight:600;">
                Make the best out of Salone Opportunity Hub
              </p>
              <p style="margin:0 0 4px; color:#64748b; font-size:13px;">
                Welcome onboard!
              </p>
              <p style="margin:0; color:#64748b; font-size:13px;">
                CEO: Sheku Foryoh
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px;">
                &copy; 2026 Salone Opportunity Hub. All rights reserved.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                If you did not create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/


-- ============================================================
-- TEMPLATE 2: Reset Password (Magic Link)
-- ============================================================
-- Supabase template variable: {{ .ConfirmationURL }}
-- Go to: Authentication > Email Templates > Reset password
-- Set Subject to: Reset Your Password - Salone Opportunity Hub
-- ============================================================

/*
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1d4ed8; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                SALONE OPPORTUNITY HUB
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px; color:#1e293b; font-size:20px; font-weight:700;">
                Reset Your Password
              </h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:8px; background-color:#1d4ed8;">
                    <a href="{{ .ConfirmationURL }}"
                       target="_blank"
                       style="display:inline-block; padding:14px 36px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#64748b; font-size:13px; line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 32px; word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#1d4ed8; font-size:13px; text-decoration:underline;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 24px;" />

              <p style="margin:0 0 6px; color:#475569; font-size:14px; font-weight:600;">
                Make the best out of Salone Opportunity Hub
              </p>
              <p style="margin:0 0 4px; color:#64748b; font-size:13px;">
                Welcome onboard!
              </p>
              <p style="margin:0; color:#64748b; font-size:13px;">
                CEO: Sheku Foryoh
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px;">
                &copy; 2026 Salone Opportunity Hub. All rights reserved.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/


-- ============================================================
-- TEMPLATE 3: Magic Link (Passwordless Login)
-- ============================================================
-- Supabase template variable: {{ .ConfirmationURL }}
-- Go to: Authentication > Email Templates > Magic link
-- Set Subject to: Your Login Link - Salone Opportunity Hub
-- ============================================================

/*
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Login Link</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1d4ed8; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                SALONE OPPORTUNITY HUB
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px; color:#1e293b; font-size:20px; font-weight:700;">
                Your Login Link
              </h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                Click the button below to securely log in to your Salone Opportunity Hub account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:8px; background-color:#1d4ed8;">
                    <a href="{{ .ConfirmationURL }}"
                       target="_blank"
                       style="display:inline-block; padding:14px 36px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Log In to Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#64748b; font-size:13px; line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 32px; word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#1d4ed8; font-size:13px; text-decoration:underline;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 24px;" />

              <p style="margin:0 0 6px; color:#475569; font-size:14px; font-weight:600;">
                Make the best out of Salone Opportunity Hub
              </p>
              <p style="margin:0 0 4px; color:#64748b; font-size:13px;">
                Welcome onboard!
              </p>
              <p style="margin:0; color:#64748b; font-size:13px;">
                CEO: Sheku Foryoh
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px;">
                &copy; 2026 Salone Opportunity Hub. All rights reserved.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                If you did not request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/


-- ============================================================
-- TEMPLATE 4: Change Email Address
-- ============================================================
-- Supabase template variable: {{ .ConfirmationURL }}
-- Go to: Authentication > Email Templates > Change email address
-- Set Subject to: Confirm Your New Email - Salone Opportunity Hub
-- ============================================================

/*
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Your New Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1d4ed8; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                SALONE OPPORTUNITY HUB
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px; color:#1e293b; font-size:20px; font-weight:700;">
                Confirm Your New Email
              </h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                You requested to change your email address. Click the button below to confirm this change.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="border-radius:8px; background-color:#1d4ed8;">
                    <a href="{{ .ConfirmationURL }}"
                       target="_blank"
                       style="display:inline-block; padding:14px 36px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#64748b; font-size:13px; line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 32px; word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#1d4ed8; font-size:13px; text-decoration:underline;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 24px;" />

              <p style="margin:0 0 6px; color:#475569; font-size:14px; font-weight:600;">
                Make the best out of Salone Opportunity Hub
              </p>
              <p style="margin:0 0 4px; color:#64748b; font-size:13px;">
                Welcome onboard!
              </p>
              <p style="margin:0; color:#64748b; font-size:13px;">
                CEO: Sheku Foryoh
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:24px 40px; text-align:center; border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px;">
                &copy; 2026 Salone Opportunity Hub. All rights reserved.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                If you did not request this change, please contact support immediately.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/
