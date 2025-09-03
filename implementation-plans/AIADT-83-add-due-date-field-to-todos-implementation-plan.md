# Implementation Plan: AIADT-83 Add Due Date field to todos

## Objective and Non-goals

**Objective:** Add optional due date support to Todo items allowing users to set, view, edit, and clear a due date with persistence in sessionStorage and backward-compatible loading of existing todos.
**Non-goals:** Notifications, reminders, calendar sync, auto-sorting by date, backend/API persistence, timezone normalization beyond client-local formatting, accessibility overhaul of modal, or styling overdue badge beyond minimal visual distinction.

## Architecture / Design Overview

Current state:

- `Todo` interface (src/types/Todo.ts) lacks due date.
- Todo CRUD handled in `TodoContext` (not yet read here but assumed: add, edit, toggle, delete) with sessionStorage persistence (per earlier story AIADT-11 clone reference implying persistence is in place or being added; we validate presence before coding; fallback if absent is to add minimal persistence extension).
- UI creation/editing handled by `TodoModal`.
- Display handled by `TodoItem` within list.

Changes:

- Extend `Todo` interface with optional `dueDate?: string` using date-only ISO format `YYYY-MM-DD`.
- Update context add/edit logic to accept and persist `dueDate` (guard invalid -> undefined).
- Introduce lightweight validation utility for date parsing.
- Add DatePicker to modal (from `@mui/x-date-pickers`) inside a new `LocalizationProvider` wrapper at app root (likely in `App.tsx` or Theme provider layer).
- Display formatted due date (`format(new Date(dueDate), 'PP')`) in `TodoItem`; add subtle style and optional overdue indicator when past and not completed.
- Backward compatibility: existing stored items missing `dueDate` remain valid.
- Provide clear button to remove due date while editing.

## Detailed Steps (File-by-File)

1. `package.json`
   - Add dependencies: `@mui/x-date-pickers`, `@mui/x-date-pickers/AdapterDateFns`, `date-fns`.
2. `src/types/Todo.ts`
   - Add `dueDate?: string;` comment noting date-only format.
3. `src/contexts/TodoContext.tsx` (assumed structure):
   - Update addTodo signature: `(title: string, description: string, dueDate?: string)`.
   - Update editTodo to include optional `dueDate` modifications and clearing.
   - Add helper `sanitizeDueDate(value: string | undefined): string | undefined` that returns undefined if falsy or invalid (use `isValidDateOnly` helper).
   - On load from storage: leave items unchanged; do not crash if missing field.
   - On save: store `dueDate` as-is (no timezone adjustment) after sanitization.
4. `src/utils/date.ts` (new):
   - Export `isValidDateOnly(str: string): boolean` ensuring regex `^\d{4}-\d{2}-\d{2}$` and `!isNaN(new Date(str).getTime())`.
   - Export `isOverdue(dueDate: string, completed: boolean): boolean`.
5. `src/components/TodoModal/TodoModal.tsx`:
   - Import DatePicker, AdapterDateFns, LocalizationProvider placement will be higher (App).
   - Add local state for `dueDate` (string | undefined).
   - In edit mode prefill existing due date.
   - Provide DatePicker with value as `dueDate ? new Date(dueDate) : null`, onChange store date-only string.
   - Add small button or icon `Clear Due Date` to set undefined.
   - On submit pass dueDate into add/edit functions.
6. `src/App.tsx` (or `ThemeProvider` wrapper):
   - Wrap inside `<LocalizationProvider dateAdapter={AdapterDateFns}>`.
7. `src/components/TodoList/TodoItem.tsx`:
   - If `todo.dueDate` show formatted date below description or inline; if overdue and not completed add a small red badge or variant text `(Overdue)`.
8. `tests` (`src/__tests__`):
   - Add test: creation with due date persists and displays.
   - Add test: editing can clear due date.
   - Add test: legacy data without dueDate loads (simulate context initialization from array missing field).
   - Update any existing tests expecting `addTodo(title, description)` signature (add optional 3rd param or adapt mocks).
   - Add date validation test ensuring invalid date string is discarded.
9. Optional styling: minimal theme override or inline `sx` to differentiate overdue (e.g., `color: 'error.main'`).

## Data / Schema Changes & Migration

- Schema change: `Todo` extended with `dueDate?: string` (date-only `YYYY-MM-DD`).
- Migration: None required; optional field; loader must treat absent or invalid as undefined.

## API Contracts / External Integrations

- No external network APIs. Only UI library addition.
- DatePicker from MUI requires adapter; ensure import and wrapping provider.

## Feature Flags / Config

- No feature flag. If needed later, could gate rendering of date UI behind env var (not in scope now).

## Tests

Unit tests:

- `TodoContext` add with due date.
- Edit to change due date.
- Edit to clear due date.
- Legacy load without dueDate.
- Invalid due date not persisted.
  Component tests:
- Modal shows date picker, can select date, submit, item displays.
- Overdue styling if date < today and not completed.

(No integration/e2e beyond current scope.)

## Telemetry / Monitoring

- Not applicable (client-only demo). Could log console.warn for invalid date discard (optional, not required).

## Risks, Edge Cases, Rollback

Risks:

- Invalid date parsing causing timezone shift (mitigated by date-only storage).
- Dependency size increase (acceptable per clarification).
- Tests failing due to changed function signatures.
  Edge Cases:
- Empty or cleared date -> should not persist stale value.
- Invalid manual input (guard -> undefined).
- Overdue calculation around midnight (acceptable minor variance).
  Rollback:
- Revert added code plus remove `dueDate` field; existing data remains unaffected.

## Acceptance Criteria Mapping

- Optional pick due date: DatePicker in modal (Steps 5,6) ✔
- Existing todos unaffected: Loader unchanged (Step 3) ✔
- Editing shows & can remove: Modal prefill + clear button (Step 5) ✔
- Due date shows in list: Item rendering (Step 7) ✔
- Validation invalid date blocked: sanitize + tests (Steps 3,4,8) ✔
- Persistence across refresh + legacy support: context storage + legacy test (Steps 3,8) ✔
- All unit tests pass & coverage maintained: new/updated tests (Step 8) ✔

## Execution Task List

1. Add dependencies to `package.json` & install.
2. Update `Todo` interface.
3. Implement date utilities file.
4. Update `TodoContext` add/edit & storage logic for dueDate.
5. Wrap app with `LocalizationProvider`.
6. Enhance `TodoModal` with date picker + clear.
7. Update `TodoItem` display & overdue styling.
8. Write/update tests (context, modal, item, legacy load, validation).
9. Run test suite & adjust.
10. Final review & commit.

## Execution Guide

Follow task list sequentially; run tests after steps 4, 6, 7, 8.

## Prompt (For AI Agent Execution)

"""
Implement AIADT-83 (Add Due Date field to todos) following these constraints:

- Store dueDate as YYYY-MM-DD or undefined.
- Validate via regex and Date; discard invalid.
- Extend context methods to accept dueDate.
- Provide DatePicker UI with clear functionality.
- Format display using date-fns `format(new Date(dueDate), 'PP')`.
- Add overdue visual indicator if past and not completed.
- Maintain backward compatibility for existing todos.
- Update and add tests enumerated in plan.
  """

## Verification Checklist

- [ ] Type updated in `Todo.ts`
- [ ] Context functions support dueDate
- [ ] Date utilities created & used
- [ ] Modal shows picker & clear button
- [ ] App wrapped with LocalizationProvider
- [ ] Item displays formatted date & overdue indicator
- [ ] Legacy data test passes
- [ ] New tests for add/edit/clear/validation pass
- [ ] No console errors
