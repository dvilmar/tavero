---
name: mobile-a11y-audit
description: Audits React Native mobile screens for accessibility and fixes issues in-place. Use when user asks for UI/UX review, accessibility, VoiceOver/TalkBack support, contrast, touch targets, labels, focus flow, modals, or keyboard navigation in tavero-app.
---

# Mobile A11y Audit (Tavero App)

## Quick Start

When request mentions UI/UX quality or accessibility in mobile:

1. Audit target screens/components in `tavero-app/src/app` and `tavero-app/src/components/ui`.
2. Detect violations with this checklist.
3. Apply minimal code fixes.
4. Re-run lint checks in edited files.
5. Return concise report: critical issues first, then fixed items, then residual risks.

## Mandatory Checklist

- Interactive element has accessible name:
	- `accessibilityLabel` for icon-only buttons.
	- Visible text still should be meaningful.
- Interactive element has semantic role:
	- `accessibilityRole='button' | 'switch' | 'link'`.
- State announced:
	- `accessibilityState={{ disabled, selected, checked, busy }}` when relevant.
- Tap targets large enough:
	- Minimum ~44x44 via styles or `hitSlop`.
- Focus/navigation predictable:
	- Order matches visual flow.
	- No hidden/disabled trap.
- Dynamic feedback announced:
	- Errors/success/loading use visible text and, when needed, `AccessibilityInfo.announceForAccessibility`.
- Modal behavior safe:
	- Trap focus in modal content.
	- Restore focus on close when applicable.
- Motion respects preferences:
	- Avoid critical info only through animation.

## Tavero-Specific Priorities

- Auth flow (`(auth)`): login, forgot/reset password, error messages, Enter/submit behavior.
- Dashboard/settings/menu screens: primary actions and destructive actions (`signOut`, delete).
- Drag interactions (`DragHandle`, draggable lists): provide non-gesture fallback actions if needed.
- i18n screens: labels work in Spanish/English and do not truncate critical meaning.

## Fix Patterns

- Icon pressable without label:
	- Add `accessibilityRole='button'` + `accessibilityLabel={t('...')}`.
- Small touch area:
	- Keep visual size; add `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`.
- Toggle/switch:
	- Add role/state and keep label bound to switch context.
- Async submit:
	- Disable button while saving and expose busy state.

## Output Format

Use this structure:

```markdown
## A11y Review
- Critical: ...
- Major: ...
- Minor: ...

## Applied Fixes
- `path/file.tsx`: what changed + why.

## Remaining Risk
- Manual VoiceOver/TalkBack checks pending on: ...
```
