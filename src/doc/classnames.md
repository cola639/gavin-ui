`classNames` 是一个用于条件地组合 CSS 类名的 JavaScript 库，非常适合在 React 组件中根据某些条件动态设置类名。以下是一些经典用法以及如何在 React 项目中使用它。

### 安装 `classNames`

首先，确保你已经安装了 `classNames` 库：

```bash
npm install classnames
```

### 使用 `classNames` 库

以下是如何在 React 组件中使用 `classNames` 来条件性地组合类名。

#### 示例 1：基本用法

```tsx
import React from 'react'
import classNames from 'classnames'
import './styles.css'

const Button = ({ primary, disabled }) => {
  const buttonClass = classNames({
    button: true,
    'button-primary': primary,
    'button-disabled': disabled
  })

  return <button className={buttonClass}>Click me</button>
}

export default Button
```

在这个示例中，根据 `primary` 和 `disabled` 的布尔值，`buttonClass` 将会是不同的组合。

#### 示例 2：使用对象语法

```tsx
import React from 'react'
import classNames from 'classnames'
import './styles.css'

const MyComponent = ({ isActive }) => {
  return (
    <div className={classNames('my-component', { 'is-active': isActive })}>
      Hello World
    </div>
  )
}

export default MyComponent
```

#### 示例 3：结合静态类名和条件类名

```tsx
import React from 'react'
import classNames from 'classnames'
import './styles.css'

const MyComponent = ({ size, isPrimary }) => {
  const componentClass = classNames('component', {
    'component--large': size === 'large',
    'component--small': size === 'small',
    'component--primary': isPrimary
  })

  return <div className={componentClass}>My Component</div>
}

export default MyComponent
```

#### 示例 4：使用数组语法

```tsx
import React from 'react'
import classNames from 'classnames'
import './styles.css'

const MyComponent = ({ isHidden }) => {
  return (
    <div
      className={classNames('my-component', ['class1', 'class2'], {
        'is-hidden': isHidden
      })}
    >
      Hello World
    </div>
  )
}

export default MyComponent
```

#### 示例 5：结合 CSS Modules

假设你有一个 CSS 模块文件 `styles.module.css`：

```css
/* styles.module.css */
.button {
  padding: 10px;
  border: none;
}

.button-primary {
  background-color: blue;
  color: white;
}

.button-disabled {
  background-color: gray;
  color: darkgray;
}
```

在你的 React 组件中使用 CSS 模块和 `classNames`：

```tsx
import React from 'react'
import classNames from 'classnames'
import styles from './styles.module.css'

const Button = ({ primary, disabled }) => {
  const buttonClass = classNames(styles.button, {
    [styles.buttonPrimary]: primary,
    [styles.buttonDisabled]: disabled
  })

  return <button className={buttonClass}>Click me</button>
}

export default Button
```

### 完整示例

以下是一个完整的示例，将 `classNames` 与 CSS 模块结合使用，并根据条件应用类名：

#### `Item.module.scss`

```scss
/* Item.module.scss */
.item {
  position: relative;
  flex-grow: 1;
}

.link {
  cursor: pointer;
  display: table;
  position: relative;
  display: flex;
  z-index: 1;
  justify-content: center;
  align-items: center;
  height: 60px;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}

.link div,
.link span,
.link svg {
  width: 20px;
  height: 20px;
  display: block;
}

.link div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -84%);
}

.link div span {
  width: 20px;
  bottom: 0;
  left: 0;
  transform-origin: 50% 50%;
  position: absolute;
  overflow: hidden;
  z-index: 1;
  background: #fff;
  transform: scale(0.94);
  transform-origin: 0 100%;
  -webkit-animation: down 0.3s linear forwards;
  animation: down 0.3s linear forwards;
}

.link div span svg {
  position: absolute;
  left: 0;
  bottom: 0;
}

.link div span:first-child {
  height: 20px;
}

.link div span:first-child svg {
  transition:
    fill 0.3s ease,
    stroke 0.3s ease;
}

.link div span:last-child {
  height: 0;
  z-index: 5;
  transition: height 0.25s ease;
}

.link div span:last-child svg {
  fill: #47a8f2;
  stroke: #47a8f2;
}

.link strong {
  font-size: 10px;
  font-weight: 600;
  margin-top: 28px;
  color: #99a3ba;
  transition: all 0.3s ease;
}

.active .link {
  z-index: 5;
}

.active .link div span {
  animation: high 0.35s linear forwards 0.05s;
}

.active .link div span:last-child {
  height: 20px;
  transition: height 0.3s ease 0.25s;
}

.active .link strong {
  color: #47a8f2;
  font-weight: 700;
}

@keyframes high {
  0% {
    transform: rotate(0deg) scale(0.94);
  }
  33% {
    transform: rotate(8deg);
  }
  66% {
    transform: rotate(8deg) translateY(-1px);
  }
  100% {
    transform: rotate(0deg) scale(1) translateY(-1px);
  }
}

@keyframes down {
  0% {
    transform: rotate(0deg) scale(1) translateY(-1px);
  }
  33% {
    transform: rotate(8deg);
  }
  66% {
    transform: rotate(8deg) translateY(0);
  }
  100% {
    transform: rotate(0deg) scale(0.94) translateY(0);
  }
}
```

#### `Item.tsx`

```tsx
import React, { FC, ReactNode } from 'react'
import classNames from 'classnames'
import styles from './Item.module.scss'

interface IItem {
  tab: { name: string; icon: ReactNode; iconFilled: ReactNode; url: string }
  activeTab: string
  color: string
  handleActive: (url: string) => void
}

const Item: FC<IItem> = ({ tab, activeTab, handleActive, color }) => {
  return (
    <li
      key={tab.name}
      className={classNames(styles.item, {
        [styles.active]: activeTab === tab.url
      })}
      onClick={() => handleActive(tab.url)}
      style={{ '--color': color } as React.CSSProperties}
    >
      <a className={styles.link}>
        <div>
          <span>{tab.icon}</span>
          <span>{tab.iconFilled}</span>
        </div>
        <strong>{tab.name}</strong>
      </a>
    </li>
  )
}

export default Item
```

### 总结

使用 `classNames` 库可以简化根据条件组合类名的过程，特别是在处理动态样式时非常有用。结合 CSS Modules 可以使你的样式更加模块化和可维护。以上示例展示了如何在 React 项目中使用 `classNames` 库，以实现更优雅的样式管理。 G
