import { ReactComponent as Application } from 'assets/icons/application.svg';
import { ReactComponent as PunchIcon } from 'assets/icons/punch_v1.svg';
import Tabar from 'components/tabar';
import { FC, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router-dom';
import styles from './index.module.scss';

// ==============================|| TEMPLATE ||============================== //

const Index: FC = () => {
  const intl = useIntl();

  const tabs = [
    { name: intl.formatMessage({ id: 'dashboard', defaultMessage: 'dashboard' }), url: '/', icon: <PunchIcon />, iconFilled: <PunchIcon /> },
    {
      name: intl.formatMessage({ id: 'profile', defaultMessage: 'profile' }),
      url: '/profile',
      icon: <Application />,
      iconFilled: <Application />
    }
  ];

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.layout_content}>
        <Outlet />
      </div>
      <div className={styles.layout_footer}>
        <Tabar tabs={tabs} />
      </div>
    </div>
  );
};

export default Index;
