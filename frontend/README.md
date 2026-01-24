# UI Components

Documentation for the shared UI components:

- `Button`
- `Badge`
- `Input`
- `Modal`
- `Select`
- `Textarea`

All components use CSS Modules (`style.module.scss`).

---

## Button

**File:** `components/ui/button`

### Types

```ts
export const enum ButtonType {
  Default = "default",
  Outline = "outline",
  Link = "link",
  Text = "text",
  Icon = "icon",
}
```

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `id` | `string` | — | Optional `id` attribute for the `<button>` |
| `text` | `string` | — | Button label (not rendered for `ButtonType.Icon`) |
| `callback` | `(event?: React.MouseEvent<HTMLButtonElement>) => void` | `() => console.log("")` | Click handler |
| `ariaLabel` | `string` | — | Accessibility label for icon-only buttons or when text is not enough |
| `type` | `ButtonType` | `ButtonType.Default` | Controls styling via CSS module class name |
| `icon` | `React.ReactNode` | — | Optional icon element; rendered before `text` |
| `large` | `boolean` | `false` | Adds `styles.large` |
| `dark` | `boolean` | `false` | Adds `styles.dark` |
| `disabled` | `boolean` | `false` | Disables the button |
| `isLoading` | `boolean` | `false` | Shows loader instead of icon/text |
| `htmlType` | `"button" \| "submit" \| "reset"` | `"button"` | Native button type |

### Behavior

- When `isLoading` is `true`, the button shows `styles.loader` and hides icon/text.
- When `type === ButtonType.Icon`, only the icon is rendered (no text span).

### Examples

```tsx
<Button text="Save" callback={() => doSave()} />

<Button
  type={ButtonType.Outline}
  text="Cancel"
  callback={() => setOpen(false)}
/>

<Button
  type={ButtonType.Icon}
  ariaLabel="Close"
  icon={<CloseIcon />}
  callback={() => setOpen(false)}
/>

<Button
  text="Submit"
  htmlType="submit"
  isLoading={isSubmitting}
/>
```

---

## Badge

**File:** `components/ui/badge`

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `tone` | `"neutral" \| "positive" \| "warning" \| "negative"` | — | Currently only `neutral` is explicitly styled in the component logic |
| `text` | `string` | — | Text displayed in the badge |

### Behavior

- If `tone === "neutral"`, the badge uses both `styles.badge` and `styles.neutral`.
- For any other tone (or `undefined`), it renders `styles.badge` only.

### Example

```tsx
<Badge tone="neutral" text="Draft" />
<Badge text="Default" />
```

---

## Input

**File:** `components/ui/input`

### Types

```ts
export const enum InputType {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email",
  NUMBER = "number",
  CHECKBOX = "checkbox",
  RADIO = "radio",
}

export type IconPosition = "leading" | "trailing";
```

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `id` | `string` | — | Required; used for `htmlFor` and input `id` |
| `inputType` | `InputType` | `InputType.TEXT` | Determines input type and layout |
| `label` | `string` | — | Rendered above input for text-like inputs; inline for checkbox/radio |
| `placeholder` | `string` | — | Input placeholder |
| `value` | `string \| number` | — | Used for non-checkbox/radio inputs |
| `handleInput` | `(e: Event) => void` | — | `onInput` handler (Preact/React compatible) |
| `errorMessage` | `string` | — | Adds error styles and shows message |
| `checked` | `boolean` | — | Used for checkbox/radio inputs |
| `disabled` | `boolean` | `false` | Disables the input |
| `name` | `string` | — | Native input `name` |
| `limit` | `number` | — | Applied as `maxlength` |
| `icon` | `React.ReactNode` | — | Icon shown inside input for non-checkbox/radio |
| `iconPosition` | `"leading" \| "trailing"` | `"leading"` | Controls icon alignment |

### Behavior

- Checkbox/Radio:
  - Uses `styles.inline_input` layout.
  - `checked` is applied; `value` is not.
  - Label is rendered inline.
- Text-like inputs:
  - Label is rendered above input (if provided).
  - `value` is applied; `checked` is not.
- Icons:
  - Only shown for non-checkbox/radio types.
  - Adds `styles.with_icon` and `styles.icon_leading` / `styles.icon_trailing`.

### Examples

```tsx
<Input
  id="email"
  inputType={InputType.EMAIL}
  label="Email"
  placeholder="you@example.com"
  value={email}
  handleInput={(e) => setEmail((e.target as HTMLInputElement).value)}
/>

<Input
  id="remember"
  inputType={InputType.CHECKBOX}
  label="Remember me"
  value=""
  checked={remember}
  handleInput={(e) => setRemember((e.target as HTMLInputElement).checked)}
/>

<Input
  id="search"
  label="Search"
  value={q}
  icon={<SearchIcon />}
  iconPosition="leading"
  handleInput={(e) => setQ((e.target as HTMLInputElement).value)}
/>
```

---

## Modal

**File:** `components/ui/modal`

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `title` | `string` | — | Required; shown as heading |
| `hint` | `string` | — | Optional hint text under the title |
| `content` | `React.ReactNode` | — | Required; main content area |
| `isOpen` | `boolean` | — | Required; controls visibility |
| `onClose` | `() => void` | — | Required; called when modal closes |
| `footerType` | `"single" \| "double"` | `"single"` | Single primary button vs Cancel+Submit |
| `primaryButtonText` | `string` | `"Close"` | Label for single-footer primary button |
| `onPrimaryClick` | `() => void` | — | If omitted, primary click closes modal |
| `cancelButtonText` | `string` | `"Cancel"` | Label for cancel button (double footer) |
| `submitButtonText` | `string` | `"Submit"` | Label for submit button (double footer) |
| `onCancel` | `() => void` | — | If omitted, cancel closes modal |
| `onSubmit` | `() => void` | — | Called when submit is pressed (double footer) |

### Behavior

- Clicking the overlay closes the modal.
- Clicking inside the modal (`.popup`) does not close it (event propagation is stopped).
- Pressing `Escape` closes the modal while `isOpen` is true.
- Footer modes:
  - `single`: one primary button
  - `double`: Cancel (outline) + Submit (default)

### Examples

**Single footer:**

```tsx
<Modal
  title="Info"
  content={<div>Something happened.</div>}
  isOpen={open}
  onClose={() => setOpen(false)}
/>
```

**Double footer:**

```tsx
<Modal
  title="Delete project"
  hint="This action cannot be undone."
  content={<div>Are you sure?</div>}
  isOpen={open}
  onClose={() => setOpen(false)}
  footerType="double"
  cancelButtonText="Cancel"
  submitButtonText="Delete"
  onCancel={() => setOpen(false)}
  onSubmit={() => doDelete()}
/>
```

---

## Select

**File:** `components/ui/select`

### Types

```ts
interface SelectOption {
  value: string;
  label: string;
}
```

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `id` | `string` | — | Required; used for `label` and `select` id |
| `label` | `string` | — | Optional label |
| `value` | `string` | — | Current selected value |
| `options` | `SelectOption[]` | — | Options list |
| `placeholder` | `string` | — | Renders a disabled placeholder option when `value === ""` |
| `handleChange` | `(e: Event) => void` | — | `onChange` handler |
| `errorMessage` | `string` | — | Shows message and error styling |
| `disabled` | `boolean` | `false` | Disables select |
| `name` | `string` | — | Native select name |

### Example

```tsx
<Select
  id="db-type"
  label="Database Type"
  value={dbType}
  placeholder="Select type…"
  options={[
    { value: "psql", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "mssql", label: "MSSQL" },
  ]}
  handleChange={(e) => setDbType((e.target as HTMLSelectElement).value)}
/>
```

---

## Textarea

**File:** `components/ui/textarea`

### Props

| Prop | Type | Default | Notes |
|---|---|---:|---|
| `id` | `string` | — | Required |
| `label` | `string` | — | Optional label |
| `placeholder` | `string` | — | Placeholder text |
| `value` | `string` | — | Current value |
| `handleInput` | `(e: Event) => void` | — | `onInput` handler |
| `errorMessage` | `string` | — | Shows error message |
| `disabled` | `boolean` | `false` | Disables textarea |
| `name` | `string` | — | Native textarea name |
| `rows` | `number` | `3` | Height in rows |

### Example

```tsx
<Textarea
  id="query"
  label="SQL Query"
  placeholder="SELECT * FROM ..."
  value={query}
  rows={8}
  handleInput={(e) => setQuery((e.target as HTMLTextAreaElement).value)}
/>
```

---

## Notes / Known Improvements

- `Badge` currently only handles `tone="neutral"` explicitly. If you want full tone support, add branches or map tones to classes.
- `Input` uses `minlength` / `maxlength` attributes; in React these are typically `minLength` / `maxLength`. Preact accepts the lowercase attributes, but if you use React strictly, consider switching to camelCase.
- `Select` casts `handleChange` via `as any`. If you want proper typing, you can type it as `React.ChangeEventHandler<HTMLSelectElement>` in React-only code.
