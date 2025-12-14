import React from 'react';

export type SvgIconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

/**
 * Load all svg under @/assets/icons as React components.
 * File name (without .svg) becomes the icon key, lowercased.
 */
const modules = import.meta.glob('@/assets/icons/*.svg', {
  eager: true,
  import: 'ReactComponent'
}) as Record<string, SvgIconComponent>;

export const iconRegistry: Record<string, SvgIconComponent> = {};
for (const [path, Comp] of Object.entries(modules)) {
  const file = path.split('/').pop() || '';
  const name = file.replace(/\.svg$/i, '').toLowerCase();
  if (name) iconRegistry[name] = Comp;
}

export const iconNames = Object.keys(iconRegistry).sort((a, b) => a.localeCompare(b));

export const hasIcon = (name?: string | null) => !!name && !!iconRegistry[name.toLowerCase()];
