# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x | ✅ Yes |

## Reporting a Vulnerability

If you discover a security vulnerability in EcoTrace, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email: dramnani02@gmail.com
3. Include a description of the vulnerability and steps to reproduce

We will respond within 48 hours and aim to patch confirmed vulnerabilities within 7 days.

## Security Measures in This Project

- Security headers configured via `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- All user inputs are validated before processing via `validateInputs()`
- No sensitive data is stored — all calculations happen client-side
- No external API calls in production — fully self-contained
- Dependencies regularly audited via `npm audit`
