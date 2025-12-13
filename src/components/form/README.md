

<img src="/Users/gavin/Library/Application Support/typora-user-images/image-20251213200249900.png" alt="image-20251213200249900" style="zoom:50%;" />

// @/components/form

Form Components Usage Guide (AI-Friendly)

This package contains a small set of **React + TypeScript** form components:

- `TextInput` — labeled `<input>` with error rendering + ARIA wiring
- `Dropdown` — labeled `<select>` with placeholder + error rendering
- `RadioGroup` — labeled radio button group
- `DeptTreeDropdown` — Ant Design `TreeSelect` wrapper for department tree selection
- `UserForm` — composed form that validates and submits a single payload

> Note: some uploaded files include literal `...` in the middle of code lines (truncated content). The APIs and behaviors below are based on the visible parts of the files and standard patterns used in the shown code.

---

## Shared conventions

### ID/name derivation
When an explicit `id`/`name` isn’t provided, components derive one from `label`:

- `label.toLowerCase().replace(/\s+/g, '-')`

This means **duplicate labels on the same page can cause id/name collisions**. Pass explicit `id` or `name` when needed.

### Error rendering and ARIA
When `error` is provided:
- The control sets `aria-invalid={true}`
- The control sets `aria-describedby` to the error element id
- An error `<span>` is rendered

---

## Component APIs

## 1) `TextInput`

### Purpose
A labeled `<input>` that forwards standard input props, and shows an error message if present.

### Props (TypeScript)
```ts
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  id?: string;
};
```

### Behavior
- `inputId = id || slug(label)`
- Adds `styles.inputError` when `error` exists
- ARIA:
  - `aria-invalid={!!error}`
  - `aria-describedby={error ? `${inputId}-error` : undefined}`

### Example
```tsx
<TextInput
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  error={errors.email}
/>
```

---

## 2) `Dropdown`

### Purpose
A labeled `<select>` that supports a placeholder option and error rendering.

### Props (TypeScript)
```ts
type Option = { label: string; value: string };

type Props = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  id?: string;
  error?: string;
  placeholder?: string;
  required?: boolean; // defaults to true
};
```

### Behavior
- `selectId = id || slug(label)`
- Placeholder is rendered as an `<option value="" disabled hidden>`
- The control stays controlled by coercing undefined to `''`
- `onChange` emits the selected value: `onChange?.(e.target.value)`
- Error span id is `errId = `${selectId}-error`` and wired via `aria-describedby`

### Example
```tsx
<Dropdown
  label="Role"
  value={roleId}
  onChange={setRoleId}
  options={[
    { label: "Admin", value: "1" },
    { label: "User", value: "2" },
  ]}
  placeholder="Please select"
  error={errors.role}
/>
```

---

## 3) `RadioGroup`

### Purpose
A group of radios that emits the selected option value.

### Props (TypeScript)
```ts
type Option = { label: string; value: string };

type Props = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  name?: string;
};
```

### Behavior
- Radio `name`:
  - `const group = name || slug(label)`
- Each option:
  - `checked = (value === option.value)`
  - `onChange={() => onChange?.(option.value)}`

### Example
```tsx
<RadioGroup
  label="Status"
  value={status}
  onChange={setStatus}
  options={[
    { label: "Enabled", value: "Enabled" },
    { label: "Disabled", value: "Disabled" },
  ]}
/>
```

---

## 4) `DeptTreeDropdown` (Ant Design TreeSelect wrapper)

### Purpose
A labeled `TreeSelect` for selecting a department from a hierarchical tree.

### Dependencies
- `antd` `TreeSelect`
- `DeptNode` type and `toAntTreeData()` converter imported from `@/views/user/depTypes`

### Props (TypeScript)
```ts
type Props = {
  label?: string;        // default: "Department"
  value?: string;
  onChange?: (value: string | undefined) => void;
  tree?: DeptNode[];     // default: []
  error?: string;
  placeholder?: string;  // default: "Please select"
};
```

### Behavior
- `treeData = useMemo(() => toAntTreeData(tree), [tree])`
- Error id: `errId = `${slug(label)}-error``
- `onChange` emits `string | undefined` (to support clear)
- ARIA:
  - `aria-invalid={!!error}`
  - `aria-describedby={error ? errId : undefined}`

### Example
```tsx
<DeptTreeDropdown
  label="Department"
  value={deptId}
  tree={deptTree}
  onChange={setDeptId}
  placeholder="Please select"
  error={errors.deptId}
/>
```

---

## 5) `UserForm`

### Purpose
A full user form that:
- Owns local state for all fields
- Validates on submit
- Emits a single payload via `onSubmit(values)`

### Public types (TypeScript)
```ts
export type UserFormValues = {
  avatar?: string | null;      // existing avatar URL when editing
  avatarFile?: File | null;    // newly picked file (for upload)

  nick: string;
  deptId?: string;
  post: string; // backend postId as string
  role: string; // backend roleId as string
  phone: string;
  email: string;
  sex: string;
  status: 'Enabled' | 'Disabled';
};

export type SimpleOption = { label: string; value: string };

export type UserFormProps = {
  initial?: Partial<UserFormValues>;
  submitLabel?: string;        // default "Submit"
  onSubmit: (values: UserFormValues) => void;
  onCancel?: () => void;       // present but may not be rendered
  deptTree?: DeptNode[];
  roles?: SimpleOption[];
  posts?: SimpleOption[];
};
```

### Validation rules
On submit:
- `nick` required (trim)
- `deptId` required
- `post` required
- `role` required
- `phone` required (trim)
- `email` required (trim) + must match: `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` (case-insensitive)
- `sex` required
- `status` required (`Enabled` | `Disabled`)

### Avatar file behavior
- Reads `e.target.files?.[0]`
- Ignores invalid files:
  - returns if missing or if `!file.type.startsWith('image/')`
- Stores:
  - `avatarFile` for upload
  - `avatarPreview = URL.createObjectURL(file)` for local preview

### Submit contract
If validation passes, it calls:
```ts
onSubmit({
  avatar: initial?.avatar ?? null,
  avatarFile,
  nick,
  deptId,
  post,
  role,
  phone,
  email,
  sex,
  status,
});
```

### Example parent integration
```tsx
function EditUserPage() {
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);
  const [roles, setRoles] = useState<SimpleOption[]>([]);
  const [posts, setPosts] = useState<SimpleOption[]>([]);

  return (
    <UserForm
      initial={{ nick: "John", status: "Enabled", avatar: "https://cdn/a.png" }}
      deptTree={deptTree}
      roles={roles}
      posts={posts}
      submitLabel="Save"
      onSubmit={(values) => {
        // If values.avatarFile exists:
        // 1) upload it -> get URL
        // 2) submit URL + other fields to backend
        console.log(values);
      }}
    />
  );
}
```

---

## Data contracts (AI-parseable)

### Option (Dropdown / RadioGroup / roles / posts)
```json
{ "label": "string", "value": "string" }
```

### `UserForm` submit payload (JSON-ish)
```json
{
  "avatar": "string|null|undefined",
  "avatarFile": "File|null|undefined",
  "nick": "string",
  "deptId": "string|undefined",
  "post": "string",
  "role": "string",
  "phone": "string",
  "email": "string",
  "sex": "string",
  "status": "Enabled|Disabled"
}
```

---

## Common gotchas

- **Duplicate labels** → duplicate ids/names. Fix by passing `id` (`TextInput`, `Dropdown`) or `name` (`RadioGroup`).
- **Controlled vs uncontrolled**: prefer always passing `value` and updating it in `onChange`.
- **TreeSelect values must be strings**: ensure `DeptNode` values map to string ids.
- **Object URL cleanup**: if avatar changes often, consider `URL.revokeObjectURL(oldUrl)` to avoid memory leaks.
