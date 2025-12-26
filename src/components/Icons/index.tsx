// Icon.tsx
import React from 'react';

const modules = import.meta.glob('@/assets/icons/*.svg', {
  eager: true,
  import: 'ReactComponent'
}) as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>;

// Build a name → component registry: "window" => ReactComponent
const registry: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {};
for (const [path, Comp] of Object.entries(modules)) {
  const file = path.split('/').pop()!; // "window.svg"
  const name = file.replace(/\.svg$/i, '').toLowerCase();
  registry[name] = Comp;
}

type IconProps = {
  name: string;
  size?: number | string;
  color?: string;
  fill?: string;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

const Icon: React.FC<IconProps> = ({ name, size = 24, color, fill, className = '', ...rest }) => {
  const key = name.toLowerCase();
  const Component = registry[key];

  if (!Component) {
    // helpful debug: show what names ARE available
    // eslint-disable-next-line no-console
    console.warn(`Icon "${name}" not found. Available: ${Object.keys(registry).join(', ')}`);
    return null;
  }

  return <Component width={size} height={size} className={className} {...rest} />;
};

export default Icon;
