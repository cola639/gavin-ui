# Modal Component Guide (AI-Friendly) — NewModuleModal Example

This document explains **how to design and implement a modal component** in this codebase, using `NewModuleModal` (create a new menu module) as the reference pattern.

It is written so an AI model can reliably infer:
1. **Which child components to use**
2. **How to design modal props**
3. **How to decide fields (count + types + defaults)**
4. **How parent pages open/close the modal and refresh data**

---

## 0) Goal and responsibilities

A modal component in this project should:
- **Render a form UI** (inputs + dropdowns)
- **Validate inputs** (before calling API)
- **Call backend API** (e.g., `createMenu(payload)`)
- **Notify parent** on success (e.g., `onCreated()`)
- **Handle close/reset** (e.g., `onClose()` + reset local state)

Parent page should:
- Own the **open/close state**
- Provide **callbacks** (close + refresh)
- Decide **parent context** (e.g., `parentId`)

---

## 1) Recommended child components

### 1.1 Use Ant Design for modal shell
Use **Ant Design `Modal`** for:
- `open` (controlled visibility)
- `onCancel` (close action)
- `onOk` (submit action)
- `confirmLoading` (loading state)
- `destroyOnClose` (reset view state when closed)

**Why:** consistent look/behavior with rest of UI and built-in loading UX.

### 1.2 Use internal form components for consistent error UI
For form fields, prefer existing in-house components:
- `TextInput` for text/number inputs
- `Dropdown` for select fields

They already implement:
- `error` string rendering
- `aria-invalid` and `aria-describedby` wiring (accessibility)
- consistent CSS Modules styling

Use them when:
- Validation can be expressed as simple string errors
- You want consistent UI across the app

### 1.3 When to use AntD `Form`
AntD `Form` is suitable when:
- You want declarative rule arrays
- You need complex cross-field validation
- You want easy `validateFields()` flow

**Rule of thumb**
- **Simple modal (few fields, basic validation):** `TextInput` + `Dropdown` + manual `errors` state
- **Complex modal (rules, dependencies):** `Form` + AntD inputs/selects

In this repo, you already have both patterns. Pick one per modal and keep it consistent.

---

## 2) Props design (modal contract)

### 2.1 Required minimal props
Every modal should support these core props:

```ts
type ModalProps = {
  open: boolean;       // parent-controlled visibility
  onClose: () => void; // close + cleanup hook
};
```

### 2.2 Optional “success callback”
If creating/editing data, add:

```ts
onCreated?: () => void; // call after successful create
// or onSaved?: () => void; for edit modals
```

This keeps the modal reusable and prevents it from directly touching parent state.

### 2.3 Context props (example: parentId)
If the payload depends on external context, add explicit props:

```ts
parentId?: number; // where to create the new node; default 0
```

**AI rule:** If the API payload needs a value that is *not* part of user input, it should be a **prop**.

### 2.4 Final recommended props for NewModuleModal
```ts
export type NewModuleModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  parentId?: number; // default 0
};
```

---

## 3) Fields design (how many, what kinds, defaults)

### 3.1 Start from backend payload schema
The create API (`POST /system/menu`) expects the following payload fields:

```json
{
  "parentId": 0,
  "icon": "bug",
  "menuType": "M",
  "menuName": "test-category",
  "orderNum": 0,
  "isFrame": "False",
  "isCache": "False",
  "visible": "True",
  "status": "Normal",
  "path": "/test-category"
}
```

### 3.2 Classify fields: user input vs system defaults
**User input (editable in modal):**
- `menuName` (string, required)
- `path` (string, required, should start with `/`)
- `icon` (string, optional)
- `orderNum` (number, required; default 0)
- `visible` (`'True'|'False'`, default `'True'`)
- `status` (`'Normal'|'Disabled'`, default `'Normal'`)
- `isFrame` (`'True'|'False'`, default `'False'`)
- `isCache` (`'True'|'False'`, default `'False'`)

**System/context (not typed by user):**
- `parentId` (from props; default `0`)
- `menuType` (constant for this modal, e.g. `'M'` for root module)

### 3.3 Field count guidance
A modal should usually stay under **6–10 fields**.
- Under 6: very simple create/edit modal
- 6–10: common admin forms (like this one)
- Over 10: consider splitting into sections or a dedicated page

`NewModuleModal` is **9 fields** (menuName, path, icon, orderNum, visible, status, isFrame, isCache + implicit menuType/parentId).

---

## 4) Validation patterns

### 4.1 Manual validation with error map (recommended with TextInput/Dropdown)
Use a small error type:

```ts
type Errors = Partial<Record<'menuName' | 'path' | 'orderNum', string>>;
```

Then:
- `validate(): Errors` returns only field errors
- show errors by passing `error={errors.menuName}` into `TextInput`
- clear errors on change (good UX)

**Minimum rules**
- `menuName`: required (trim)
- `path`: required + must start with `/`
- `orderNum`: must be numeric

### 4.2 Form-based validation (AntD Form)
If using `Form`:
- `await form.validateFields()`
- catch `errorFields` to ignore validation failures
- only show `message.error(...)` for real API failures

---

## 5) Submission and loading UX

### 5.1 Submission flow (must be deterministic)
On OK / Create:
1. validate input
2. build payload
3. set `submitting=true`
4. call API (`createMenu(payload)`)
5. on success:
   - show success message
   - reset form state
   - close modal
   - call `onCreated?.()`
6. finally: set `submitting=false`

### 5.2 Disable repeated submits
Bind loading state to modal OK button:

```tsx
<Modal confirmLoading={submitting} ... />
```

Optionally block closing while submitting:

```ts
if (submitting) return;
```

---

## 6) Parent integration pattern (how modal opens)

### 6.1 Parent owns open state
```ts
const [openNew, setOpenNew] = useState(false);
```

### 6.2 “New” button opens the modal
Your layout calls `onNew()` from:

```tsx
<IconTextButton icon={<Plus size={14} />} label="New" type="primary" onClick={onNew} />
```

So in the parent, wire:

```tsx
<MenuLayout onNew={() => setOpenNew(true)} ... />
```

### 6.3 Parent refreshes after create
Pass a refresh callback:

```tsx
<NewModuleModal
  open={openNew}
  onClose={() => setOpenNew(false)}
  onCreated={loadMenus}
  parentId={0}
/>
```

**AI rule:** `onCreated` should call the same function that initially loads the list/tree (here: `loadMenus`).

---

## 7) AI-parsable “contract summary” (cheat sheet)

### 7.1 Modal props
```ts
NewModuleModalProps = {
  open: boolean,
  onClose: () => void,
  onCreated?: () => void,
  parentId?: number
}
```

### 7.2 Local state fields
```ts
menuName: string (required)
path: string (required, startsWith '/')
icon: string (optional)
orderNum: number|string -> number
visible: 'True' | 'False'
status: 'Normal' | 'Disabled'
isFrame: 'True' | 'False'
isCache: 'True' | 'False'
```

### 7.3 Payload mapping
```ts
payload = {
  parentId: number,
  menuType: 'M',          // constant for this modal
  menuName: string,
  path: string,
  icon?: string,
  orderNum: number,
  visible: 'True'|'False',
  status: 'Normal'|'Disabled',
  isFrame: 'True'|'False',
  isCache: 'True'|'False'
}
```

---

## 8) Recommended implementation template (copy/paste)

Use this as a starting point for future modals:

```tsx
type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const MyModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  // 1) state for fields
  // 2) state for errors

  const reset = () => {
    // reset fields + errors
  };

  const validate = () => {
    // return error map
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
    reset();
  };

  const handleOk = async () => {
    const errors = validate();
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      // call API
      message.success('Success');
      onClose();
      reset();
      onSuccess?.();
    } catch (e) {
      console.error(e);
      message.error('Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onCancel={handleCancel} onOk={handleOk} confirmLoading={submitting} destroyOnClose>
      {/* render fields */}
    </Modal>
  );
};
```

---

## 9) Notes / pitfalls

- If the modal does not show, the parent must call `setOpen(true)` in `onNew`.
- If backend expects `menuType: 'M'`/`'C'` instead of `'Module'`, the modal must send the correct enum.
- Keep `onCreated` focused: refresh list/tree, do not mutate tree state manually unless necessary.
- If using `URL.createObjectURL(...)` in modals (file upload), remember to `URL.revokeObjectURL(...)` when replacing preview.
