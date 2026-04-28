---
name: mobile-form-ux
description: Optimizes mobile form UX in tavero-app authentication and CRUD screens. Use when user reports friction in inputs, submit behavior, validation messages, loading states, keyboard overlap, or conversion issues in login, password reset, categories, and products forms.
---

# Mobile Form UX (Tavero App)

## Quick Start

When user reports form friction/bugs:

1. Reproduce issue in relevant screen.
2. Audit against form checklist below.
3. Fix behavior first, then visuals.
4. Keep i18n keys and translated messages.
5. Validate loading/error/disabled states.

## Form Checklist

- Keyboard submit flow:
	- `returnKeyType` set correctly.
	- `onSubmitEditing` triggers expected next/submit action.
- Input configuration:
	- `autoCapitalize`, `autoCorrect`, keyboard type aligned with field purpose.
	- Password fields use secure native handling.
- Validation clarity:
	- Inline errors near field.
	- Message specific and translatable.
- Submission safety:
	- Block double submit while request in progress.
	- Show loading feedback.
- Failure handling:
	- Catch service/network errors.
	- Show user-facing error (`Alert`/Toast) + keep actionable state.
- Layout resilience:
	- No hidden fields/buttons under keyboard.
	- Scroll/focus still usable on small screens.

## Tavero-Specific Focus

- Auth screens:
	- `src/app/(auth)/login.tsx`
	- `src/app/(auth)/forgot-password.tsx`
	- `src/app/(auth)/reset-password.tsx`
- Product/category forms:
	- Decimal normalization for prices.
	- Required fields and delete confirmations.
- Internationalization:
	- New strings go to both locale files.

## Fix Patterns

- Enter key does nothing:
	- wire `onSubmitEditing` to submit handler.
- Button can spam requests:
	- early return if `saving/loading` true.
- Raw backend error shown:
	- map to user-friendly translated message.

## Output Format

```markdown
## Form UX Fix
- Problem: ...
- Root cause: ...
- Fix: ...

## Files Updated
- `path`: behavior change.

## Test Cases
- [ ] Happy path
- [ ] Validation errors
- [ ] Network/API failure
- [ ] Double-submit prevention
```
