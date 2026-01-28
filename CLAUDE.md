# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for PE Logan Pharmacy's GLP-1 weight loss treatment service. Hosted on GitHub Pages at https://petersedman.github.io/logan/

Developed mobile first to support mobile devices such as phones, tablets but also desktop screens.

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

### Data Flow
1. User fills questionnaire → data saved to `questionnaireState.data`
2. On submit → `checkEligibility()` evaluates BMI/age/conditions
3. `submitToFormspree()` sends data to pharmacy email
4. Results screen shows eligible (Calendly booking) or not-eligible message

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
