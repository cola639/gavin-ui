## **推荐的 React 组件内部代码顺序**

```jsx
const API_URL = '/api/user';

function UserProfile({ userId }) {
  /** 1. Props 解构 */
  // 从父组件 props 取数据
  // const { userId, role } = props;

  /** 2. State 声明 */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /** 3. Refs 声明（如果有） */
  const inputRef = useRef(null);

  /** 4. 常量 / 派生数据（memo、计算变量等） */
  const apiUrl = useMemo(() => `/api/user/${userId}`, [userId]);

  /** 5. 异步函数（数据请求） */
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl);
      setUser(res.data);
    } finally {
      setLoading(false);
    }
  };

  /** 6. Effect（副作用） */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /** 7. 事件处理函数（UI 交互） */
  const handleRefresh = () => {
    fetchUser();
  };

  /** 8. JSX 渲染 */
  return (
    <div className={styles.wrapper}>
      <h1>{user?.name}</h1>
      <button onClick={handleRefresh} disabled={loading}>
        刷新
      </button>
    </div>
  );
}
```

---

### **顺序设计的理由**

1. **Props 解构** → 一眼就知道组件需要什么输入
2. **State** → 清晰列出组件内部维护的状态
3. **Refs** → 提前声明，方便在后面事件或 effect 中使用
4. **常量 / 派生数据** → 比如 `useMemo` 计算得到的值
5. **异步函数** → 数据相关逻辑放在这里，和 UI 事件分开
6. **Effect** → 按需触发副作用（加载、监听等）
7. **事件处理函数** → 用户操作相关的方法
8. **JSX 渲染** → 最后是视觉结构，逻辑和视图分离

---

### 如果要强制执行

- **Hooks 调用顺序** → `eslint-plugin-react-hooks` 可以保证 `useState`、`useEffect` 等不乱放
- **命名规则**（`fetchXxx`、`handleXxx`） → 用 `id-match` 或 `@typescript-eslint/naming-convention`
- **自定义代码块顺序** → 需要写一个 ESLint 自定义规则（能检测 State、Effect、事件的相对位置）

---

你想要的这些 **命名格式限制**（事件处理函数、函数命名、状态变量命名、Hooks 命名、Effect 声明、State 声明、异步函数等）
**Prettier 是做不到的**，因为 Prettier 只负责**代码格式化**（缩进、分号、引号、换行等），不负责**代码语义/命名规则检查**。

这种命名格式检查要用 **ESLint**，而且需要配合一些插件，比如：

---

## 1. 限制命名格式

可以用 ESLint 的 **`id-match`** 或 **`naming-convention`** 规则（`@typescript-eslint/naming-convention`）。

例子（JavaScript）：

```json
{
  "rules": {
    // 普通变量 camelCase，常量 UPPER_CASE
    "id-match": [
      "error",
      "^[a-z][a-zA-Z0-9]*$|^[A-Z0-9_]+$",
      {
        "onlyDeclarations": true
      }
    ]
  }
}
```

例子（TypeScript，更强大）：

```json
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "variable",
        "modifiers": ["const"],
        "format": ["UPPER_CASE"]
      }
    ]
  }
}
```

---

## 2. 限制 Hooks 命名（必须以 `use` 开头）

插件：`eslint-plugin-react-hooks`

```json
{
  "extends": ["plugin:react-hooks/recommended"]
}
```

这样可以限制：

```js
function useUserData() {} // ✅
function getUserData() {} // ❌
```

---

## 3. 限制事件处理函数命名（必须 `handle` 开头）

用 **`id-match`**：

```json
{
  "rules": {
    "id-match": [
      "error",
      "^(handle|on)[A-Z].*$",
      {
        "onlyDeclarations": true
      }
    ]
  }
}
```

这样：

```js
const handleClick = () => {}; // ✅
const clickButton = () => {}; // ❌
```

---

## 4. 限制 State 声明命名

没法直接用 Prettier 实现，但可以用 `id-match` 检查 `useState` 解构变量：

```js
const [userList, setUserList] = useState([]); // ✅
const [list, setList] = useState([]); // ❌（不符合命名约定）
```

要实现这种针对 Hooks 解构的规则，需要写自定义 ESLint 规则（或用 `eslint-plugin-react-hooks-naming` 这种社区规则）。

---

## 5. 限制异步函数命名

可以用 `id-match` 或写自定义规则，让异步函数必须以 `fetch` / `load` / `get` 开头：

```json
{
  "rules": {
    "id-match": ["error", "^(fetch|get|load)[A-Z].*$"]
  }
}
```

---

✅ **结论：**

- Prettier 只管代码格式，命名规则必须用 ESLint。
- 可以用 `id-match`、`@typescript-eslint/naming-convention`、`eslint-plugin-react-hooks` 等插件实现大部分限制。
- 针对 **State 命名**、**特定 Hook 命名**，可能要写自定义 ESLint 规则。

---

好的，我帮你把 **React 组件内部建议结构顺序** 和 **命名规范建议** 做成 Markdown 文档，方便团队直接引用。

---

````markdown
# React 组件编写建议

## 组件内部结构顺序

在 React 组件内部建议按照以下顺序组织代码：

1. **State 声明**
   - 使用 `useState` 初始化组件状态。
   ```jsx
   const [user, setUser] = useState(null);
   ```
````

2. **Effect（副作用）声明**

   - 使用 `useEffect` 处理数据请求、事件监听等副作用。

   ```jsx
   useEffect(() => {
     axios.get(`${API_URL}/${userId}`).then((res) => setUser(res.data));
   }, [userId]);
   ```

3. **事件处理函数**

   - 用 `handle` 前缀命名事件方法，逻辑尽量保持单一。

   ```jsx
   const handleRefresh = () => {
     axios.get(`${API_URL}/${userId}`).then((res) => setUser(res.data));
   };
   ```

4. **渲染（JSX 返回）**

   - JSX 部分放在组件的最后，保持结构清晰。

   ```jsx
   return (
     <div className={styles.wrapper}>
       <h1>{user?.name}</h1>
       <button onClick={handleRefresh}>刷新</button>
     </div>
   );
   ```

---

## 命名规范建议

### 1. 组件命名

- 使用 `PascalCase`（大驼峰）命名组件

```jsx
function UserProfile() { ... }
export default UserProfile;
```

### 2. Hooks 命名

- 自定义 Hook 必须以 `use` 开头

```jsx
function useUserData() { ... }
```

### 3. 变量命名

- 普通变量：`camelCase`（小驼峰）
- 常量：全大写+下划线

```js
const API_URL = '/api/user';
const userName = 'Tom';
```

### 4. 状态变量命名

- 使用 `[state, setState]` 格式

```jsx
const [userList, setUserList] = useState([]);
```

### 5. 布尔变量命名

- 使用 `is` / `has` / `can` 前缀

```js
const isLoading = true;
const hasPermission = false;
const canEdit = true;
```

### 6. 函数命名

- 动词开头

```js
getUserList();
fetchData();
handleClick();
```

### 7. 事件处理函数

- 用 `handle` 前缀，且与事件对应

```js
handleSubmit();
handleChange();
handleDelete();
```

```

---

如果你愿意，我可以帮你把这个 **规范文档和 ESLint + Prettier 配置** 一起做好，这样 React 项目就可以自动检测和格式化成这种规范。这样你就不需要手动对照规则了。
```
