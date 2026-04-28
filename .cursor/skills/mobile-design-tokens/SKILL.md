---
name: mobile-design-tokens
description: Designs and refines mobile visual system for tavero-app using semantic design tokens, palette governance, typography, spacing, radius, elevation, and dark mode parity. Use when user asks to improve app look and feel, add palettes/themes, polish UI consistency, or remove visual hardcoded values.
---

# Mobile Design Tokens Pro (Tavero App)

## Quick Start

When request asks for app visual design or polish:

1. Identify visual scope: colors, typography, spacing, radius, shadows, states.
2. Route every change through semantic tokens (`bg-surface`, `text-primary`, `border-border`, `accent`).
3. Replace repeated hardcoded values with shared token constants when utility class is not possible.
4. Keep light/dark parity and contrast.
5. Validate in critical flows: auth, dashboard, settings, categories/products, menu preview.

## Rules

- Do not hardcode colors if token exists.
- Keep semantic mapping stable:
	- `primary`: main text/high emphasis.
	- `muted`: secondary/help text.
	- `surface/background`: containers vs page base.
	- `border/borderSoft`: separation hierarchy.
	- `accent/accentSoft`: brand and interactive highlights.
	- `danger/success`: status only.
- Preserve current brand palette; add new palettes as opt-in variants.
- Ensure contrast remains legible in both themes.
- Reuse existing UI primitives in `src/components/ui` before custom styling.

## Token Sources

- Theme CSS variables: `tavero-app/global.css`.
- Shared non-class tokens (RN inline style/SVG/input placeholders/shadows): `tavero-app/src/lib/designTokens.ts`.

## Tavero Palette Workflow

For new palette request:

1. Update palette source in app theme configuration.
2. Expose option in `tavero-app/src/app/(app)/menu-colors.tsx`.
3. Add translation keys in:
	- `tavero-app/src/locales/es.json`
	- `tavero-app/src/locales/en.json`
4. Document in `tavero-app/PALETTES.md`.
5. Smoke-test visual consistency in `menu-preview` and `dashboard`.

## Pro Workflow

Copy this checklist when editing:

```markdown
Token Pass
- [ ] Colors semantic, no avoidable hardcodes
- [ ] Typography hierarchy clear
- [ ] Spacing/radius consistent with existing components
- [ ] Elevation/shadows subtle and reusable
- [ ] States visible (default/pressed/disabled/loading/error)
- [ ] Light and dark parity verified
```

## Regression Checks

- Text readability on cards, buttons, forms.
- Border visibility in dark mode and low brightness.
- Disabled/loading states distinguishable.
- Status colors not confused with neutral tokens.
- New palette labels translated in `es` and `en`.
- No regressions in auth submit buttons and destructive actions.

## Output Format

```markdown
## Visual Update
- Goal: ...
- Token decisions: ...

## Files Updated
- `path`: reason.

## Validation
- Light mode: pass/fail checks.
- Dark mode: pass/fail checks.
```

## Additional Resources

- Detailed token contract and QA checklist: [reference.md](reference.md)
