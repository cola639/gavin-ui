import { FC, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Item from './Item';
import styles from './index.module.scss';

interface ITabBar {
  tabs: { name: string; icon: ReactNode; iconFilled: ReactNode; url: string }[];
}
const TabBar: FC<ITabBar> = ({ tabs }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleActive = (url: string) => {
    navigate(url);
  };

  return (
    <div className={styles.wrap}>
      <ul className={styles.ul}>
        {tabs.map((tab) => (
          <Item key={tab.name} tab={tab} handleActive={handleActive} activeTab={pathname} defaultcolor="" />
        ))}
      </ul>
    </div>
  );
};

export default TabBar;
