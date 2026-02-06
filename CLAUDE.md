# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for Logan Health's GLP-1 weight loss treatment service. Hosted at https://loganhealth.co.uk/

Developed mobile first to support mobile devices such as phones, tablets but also desktop screens.

### Workspace Structure

```
LoganHealthWorkspace/
├── LoganHealth.code-workspace    # VS Code workspace file
├── website/                      # This repo (GLPer-Ltd/LoganHealth-Website)
└── payments/                     # Cloudflare Worker (GLPer-Ltd/LoginHealth-Payments)
```

## Development

No build system - pure static files. To develop:
```bash
# Open in browser (macOS)
open index.html

# Or serve locally with Python
python3 -m http.server 8000
```

## Architecture

### JavaScript Modules (vanilla JS, no framework)

- **js/main.js** - Core UI: navigation, scroll animations (IntersectionObserver), smooth scroll, FAQ accordion. Exports `window.utils` with validation helpers (`isValidEmail`, `isValidUKPhone`)
- **js/questionnaire.js** - Multi-step form logic: BMI calculation, eligibility assessment, step validation. Exports `window.questionnaireState` containing all form data
- **js/formHandler.js** - Formspree integration. Reads from `window.questionnaireState` and POSTs to Formspree endpoint

### Data Flow (Questionnaire)
1. User fills questionnaire → data saved to `questionnaireState.data`
2. On submit → `checkEligibility()` evaluates BMI/age/conditions
3. `submitToFormspree()` sends data to pharmacy email
4. Results screen shows eligible (payment options) or not-eligible message

## Payment Integration

Payment is required before booking a consultation. The flow uses JotForm + Square for payments, Cloudflare Workers for backend logic, and Resend for email delivery.

### Payment Flow
1. User completes questionnaire and is eligible
2. User chooses payment type: **One-off** or **Monthly Subscription**
3. User is redirected to JotForm payment form (with Square integration)
4. After payment, JotForm redirects to `/payment-success.html`
5. JotForm webhook fires to Cloudflare Worker
6. Worker verifies payment, generates booking token, stores in KV, sends email
7. User receives email with tokenized booking link
8. User clicks link → `/book.html?token=xxx`
9. Booking page validates token with Worker, shows Calendly if valid

### Architecture Components

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────────────────────────┐
│  Static Site    │     │   JotForm   │     │  Cloudflare Worker               │
│  (GitHub Pages) │────▶│  + Square   │────▶│  loganhealth-payments            │
│                 │     │             │     │  .misty-heart-ac54.workers.dev   │
└─────────────────┘     └─────────────┘     └──────────────────────────────────┘
                                                          │
                              ┌────────────────┬──────────┴─────────┐
                              ▼                ▼                    ▼
                        ┌──────────┐    ┌───────────┐    ┌──────────────────┐
                        │ Resend   │    │ Cloudflare│    │ Square API       │
                        │ (email)  │    │ KV Store  │    │ (verification)   │
                        └──────────┘    └───────────┘    └──────────────────┘
```

### Cloudflare Worker (`loganhealth-payments`)

**Location:** Separate repo at `../payments/` (GitHub: GLPer-Ltd/LoginHealth-Payments)

**Endpoints:**
- `POST /api/webhook` - Receives JotForm webhook, verifies payment, creates token, sends email
- `GET /api/validate-token?token=xxx` - Validates booking token
- `POST /api/mark-used?token=xxx` - Marks token as used after booking
- `GET /health` - Health check

**Source files:**
- `src/index.js` - Route handler
- `src/webhook.js` - Webhook processing
- `src/validate.js` - Token validation
- `src/mark-used.js` - Token invalidation
- `src/email.js` - Resend email sending
- `src/square.js` - Square API verification

**Environment variables (wrangler.toml):**
- `SQUARE_ENVIRONMENT` - "sandbox" or "production"
- `BOOKING_TOKEN_TTL` - Token expiry in seconds (default: 259200 = 72 hours)
- `SITE_URL` - Base URL for booking links
- `EMAIL_FROM` - Sender email address

**Secrets (set via `wrangler secret put`):**
- `SQUARE_ACCESS_TOKEN` - Square API access token
- `EMAIL_API_KEY` - Resend API key
- `JOTFORM_API_KEY` - JotForm API key

**KV Namespace:** `BOOKING_TOKENS` - stores tokens with 72-hour TTL

### JotForm Configuration

**Two forms required:**
- **One-off:** https://pci.jotform.com/form/260355646726059
- **Subscription:** https://pci.jotform.com/form/260355571683058

**Each form has:**
- Name field
- Email field
- Hidden field `paymentType` = "one-off" or "subscription"
- Square payment integration
- Webhook to Worker: `https://loganhealth-payments.misty-heart-ac54.workers.dev/api/webhook`
- Redirect to: `https://loganhealth.co.uk/payment-success.html`

### Static Site Payment Files

- **js/questionnaire.js** - `JOTFORM_URLS` constant maps payment types to JotForm URLs
- **js/booking.js** - Token validation logic, `WORKER_URL` constant
- **book.html** - Token-gated booking page with Calendly
- **payment-success.html** - Post-payment confirmation page

### External Services

| Service | Purpose | Account |
|---------|---------|---------|
| Cloudflare | Worker hosting, KV storage | peter@glper.com |
| Square | Payment processing | (sandbox mode) |
| JotForm | Payment forms | - |
| Resend | Transactional email | peter@glper.com |

### Switching to Production

1. Update Square credentials: `wrangler secret put SQUARE_ACCESS_TOKEN`
2. Update `wrangler.toml`: `SQUARE_ENVIRONMENT = "production"`
3. Update `SITE_URL` if using custom domain
4. Redeploy: `npx wrangler deploy`

### CSS Organization

- **css/styles.css** - All styles with CSS custom properties in `:root` for theming
- **css/animations.css** - Scroll animations, keyframes, transitions

### Theming

All colors defined as CSS variables in `:root`. To change brand colors, edit these in `css/styles.css`:
```css
--color-primary: #0D9488;      /* Main teal */
--color-secondary: #F97316;    /* CTA coral */
```

## Key Configuration Points

1. **Formspree endpoint** - `js/formHandler.js` line 17: `FORMSPREE_ENDPOINT`
2. **Calendly URL** - `index.html` search for `calendly-inline-widget`
3. **Treatment pricing** - `index.html` search for `price-amount`
4. **Pharmacy contact info** - Multiple locations in `index.html`

## Eligibility Logic (questionnaire.js)

- BMI ≥ 30 (or ≥ 27.5 for non-white ethnicity)
- BMI ≥ 27 with weight-related conditions (diabetes, hypertension, heart disease)
- Age 18-85
- Not pregnant/breastfeeding
- Eating disorders and pancreatitis flagged for pharmacist review
