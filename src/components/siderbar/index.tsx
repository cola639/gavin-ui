import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

// MenuItem type definition
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: string; // Optional section label like "PAGES"
}

interface SidebarProps {
  menuItems: MenuItem[];
  isExpanded?: boolean;
  onMenuClick?: (menuId: string) => void;
  className?: string;
}

export default function Sidebar({ menuItems, isExpanded = true, onMenuClick, className = '' }: SidebarProps) {
  const [activeMenuId, setActiveMenuId] = useState<string>('dashboard');

  const handleMenuClick = (menuId: string) => {
    setActiveMenuId(menuId);
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  // Group menu items by section
  const groupedItems: { section: string | null; items: MenuItem[] }[] = [];
  let currentSection: string | null = null;
  let currentItems: MenuItem[] = [];

  menuItems.forEach((item, index) => {
    if (item.section && item.section !== currentSection) {
      if (currentItems.length > 0) {
        groupedItems.push({ section: currentSection, items: currentItems });
      }
      currentSection = item.section;
      currentItems = [item];
    } else {
      currentItems.push(item);
    }

    // Push the last group
    if (index === menuItems.length - 1) {
      groupedItems.push({ section: currentSection, items: currentItems });
    }
  });

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isExpanded ? 'w-56' : 'w-20'} ${className}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        {isExpanded ? (
          <div className="flex items-center gap-1">
            <span className="text-blue-600">Dash</span>
            <span className="text-gray-800">Stack</span>
          </div>
        ) : (
          <div className="text-blue-600 text-center">DS</div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {groupedItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Section Label */}
            {group.section && isExpanded && <div className="px-6 py-2 text-xs text-gray-400 uppercase tracking-wider">{group.section}</div>}

            {/* Menu Items */}
            <div className={!isExpanded && group.section ? 'mt-4' : ''}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenuId === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-6 py-3 cursor-pointer transition-all
                      ${
                        isActive
                          ? 'bg-blue-500 text-white border-l-4 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                      }
                      ${!isExpanded ? 'justify-center px-0' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
