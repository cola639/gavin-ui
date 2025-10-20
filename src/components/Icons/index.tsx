import React from 'react';

// 自动导入 icons 目录下的所有 svg，转成 React 组件
const icons = import.meta.glob('@/assets/icons/*.svg', { eager: true, import: 'ReactComponent' }) as any;

type IconProps = {
  name: string;
  size?: number | string;
  color?: string;
  fill?: string;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

const Icon: React.FC<IconProps> = ({ name, size = 24, color, fill, className = '', ...rest }) => {
  const mod = icons[`@/assets/icons/${name}.svg`];
  const Component = mod?.ReactComponent as React.FC<React.SVGProps<SVGSVGElement>> | undefined;

  if (!Component) {
    console.warn(`Icon "${name}" not found in assets/icons`);
    return null;
  }

  return <Component width={size} height={size} fill={fill || color || 'currentColor'} className={className} {...rest} />;
};

export default Icon;
