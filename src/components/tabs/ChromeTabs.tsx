import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import React from 'react';
import styles from './ChromeTabs.module.scss';

type Props = TabsProps & {
  className?: string;
};

const ChromeTabs: React.FC<Props> = ({ className, ...rest }) => {
  return <Tabs animated={{ inkBar: false, tabPane: true }} {...rest} className={[styles.chromeTabs, className].filter(Boolean).join(' ')} />;
};

export default ChromeTabs;
