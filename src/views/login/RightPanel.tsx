import { Phone } from 'lucide-react';
import React from 'react';
import styles from './RightPanel.module.scss';

type Props = {
  className?: string;
};

const RightPanel: React.FC<Props> = ({ className }) => {
  return (
    <aside className={`relative mx-auto mt-6 w-[735px] max-w-full rounded-[15px] ${className ?? ''}`}>
      {/* background card */}
      <div className={styles.panelBg} />

      {/* phone badge */}
      <div className="absolute right-[42px] top-[24px] flex items-center gap-2 text-white">
        <Phone size={16} strokeWidth={2.25} />
        <span className="text-[15px] font-normal whitespace-nowrap">+94 0116 789 754</span>
      </div>

      {/* illustration */}
      <div className="absolute left-[123px] top-[64px] flex h-[521px] w-[521px] items-center justify-center max-w-[calc(100%-120px)]">
        <div className={styles.illustrationBox}>[Illustration Placeholder]</div>
      </div>

      {/* panel text */}
      <div className="absolute left-[98px] bottom-[86px] text-white">
        <h2 className="mb-[14px] whitespace-nowrap text-[40px] font-semibold">Sign in to name</h2>
        <p className="w-[396px] text-[20px] font-light">Lorem Ipsum is simply</p>
      </div>

      {/* responsive behavior */}
      <div className="md:hidden" style={{ paddingBottom: '56%' }} />
    </aside>
  );
};

export default RightPanel;
