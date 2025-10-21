import React from 'react';
import styles from './index.module.scss';

// If you prefer a real image, replace the <div> with an <img src="/your-image.png" />
// The SCSS builds a soft teal panel with floating shapes similar to your screenshot.
const Illustration: React.FC = () => {
  return (
    <div className={`${styles.illustration} h-full`}>
      {/* logo placeholder */}
      <div className="absolute left-6 top-6 h-8 w-8 rounded-md bg-white/80 shadow" />
      {/* 3D-ish shapes are drawn in CSS for portability */}
      <div className={styles.shapeStack} />
    </div>
  );
};

export default Illustration;
