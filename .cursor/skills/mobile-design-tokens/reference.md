# Mobile Design Tokens Pro Reference

## Semantic Token Contract

Use this mapping to avoid visual drift:

- `primary`: headlines, main values, high-emphasis text.
- `primaryLight`: secondary emphasis on same surface.
- `muted`: helper text, metadata, hints.
- `mutedLight`: placeholders and low-priority text.
- `background`: full-screen base.
- `surface`: cards, grouped blocks, elevated containers.
- `border`: default separators and input borders.
- `borderSoft`: low-contrast separators and soft containers.
- `accent`: primary CTA and active selection.
- `accentSoft`: subtle accent surfaces, selected chips.
- `danger`: errors and destructive actions.
- `success`: success feedback only.

## Visual Hierarchy Defaults

- Headline: 20-32, bold, `text-primary`.
- Section label: 11-12, uppercase optional, `text-muted`.
- Body: 14-16, regular/medium.
- Meta labels: 11-12, `text-muted`.

## State Design Rules

- Pressed: reduce opacity only slightly (`0.8-0.9`).
- Disabled: keep readable, reduce opacity + disable action.
- Loading: preserve layout; replace label with spinner.
- Error: keep local message near control, do not hide context.
- Success: transient toast/feedback, avoid blocking UI.

## Hardcoded Value Policy

Allowed hardcoded values only when token/class impossible:

- SVG stroke/fill that cannot consume class tokens.
- `placeholderTextColor` in `TextInput`.
- Native shadow/elevation values.

When hardcoded values repeat in 2+ places, move to `src/lib/designTokens.ts`.

## Tavero QA Sweep

Run after visual changes:

1. Auth screens: input/readability/button states.
2. Dashboard/settings: spacing and text contrast.
3. Menu colors/preview: palette chips and active state.
4. Categories/products forms: borders, errors, disabled/loading.
5. Dark mode pass on at least one low-brightness display.
