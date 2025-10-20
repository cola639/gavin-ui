import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';
import styles from './item.module.scss';

interface IItem {
  tab: { name: string; icon: ReactNode; iconFilled: ReactNode; url: string };
  activeTab: string;
  defaultcolor: string;
  handleActive: (url: string) => void;
}

const Item: FC<IItem> = ({ tab, activeTab, handleActive, defaultcolor }) => {
  const handleClick = () => {
    handleActive(tab.url);
  };

  return (
    <li
      key={tab.name}
      className={classNames(styles.item, { [styles.active]: activeTab === tab.url }, { [styles.inactive]: activeTab !== tab.url })}
      style={{ color: defaultcolor } as React.CSSProperties}
      onClick={handleClick}
    >
      <a className={styles.link}>
        <div>
          <span>{tab.icon}</span>
          <span>{tab.iconFilled}</span>
        </div>
        <strong>{tab.name}</strong>
      </a>
    </li>
  );
};

export default Item;
