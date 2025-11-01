import { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// If your data sometimes stores string keys instead of components, map them here
import {
  Archive,
  BarChart3,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Heart,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Table,
  User as UserIcon,
  UserPlus,
  Users
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  user: UserIcon,
  order: ShoppingCart,
  settings: Settings,
  dashboard: LayoutDashboard,
  package: Package,
  heart: Heart,
  inbox: Inbox,
  archive: Archive,
  dollar: DollarSign,
  calendar: Calendar,
  todo: CheckSquare,
  invoice: FileText,
  chart: BarChart3,
  users: Users,
  team: UserPlus,
  table: Table,
  logout: LogOut
};

export interface MenuItem {
  onClick: () => void;
  id?: string;
  label: string;
  icon?: LucideIcon; // Component form
  iconKey?: string; // Optional string key form, e.g. 'user'
  path: string;
  section?: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  isExpanded?: boolean;
  onMenuClick?: (key: string) => void;
  activeKey?: string;
  className?: string;
}

export default function Sidebar({ menuItems, isExpanded = true, onMenuClick, activeKey: externalActiveKey, className = '' }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const itemKey = (m: MenuItem) => m.id ?? m.path;

  const urlActiveKey = useMemo(() => {
    const hit = menuItems.find((m) => location.pathname.startsWith(m.path));
    return hit ? itemKey(hit) : undefined;
  }, [menuItems, location.pathname]);

  const [internalActive, setInternalActive] = useState<string>(externalActiveKey ?? urlActiveKey ?? (menuItems[0] ? itemKey(menuItems[0]) : ''));

  useEffect(() => {
    if (externalActiveKey !== undefined) setInternalActive(externalActiveKey);
  }, [externalActiveKey]);

  useEffect(() => {
    if (urlActiveKey && urlActiveKey !== internalActive) setInternalActive(urlActiveKey);
  }, [urlActiveKey, internalActive]);

  const activeKey = externalActiveKey ?? internalActive;

  const handleClick = (item: MenuItem) => {
    const key = itemKey(item);
    setInternalActive(key);
    onMenuClick?.(key);

    // 1) custom action (e.g., logout)
    if (typeof item.onClick === 'function') {
      item.onClick();
      return;
    }

    // 2) no path → nothing to do
    const p = item.path;
    if (!p) return;

    // 3) external link support
    if (/^https?:\/\//i.test(p)) {
      window.open(p, '_blank', 'noopener,noreferrer');
      return;
    }

    // 4) avoid redundant navigation
    if (location.pathname !== p) {
      navigate(p);
    }
  };
  const grouped = useMemo(() => {
    const out: { section: string | null; items: MenuItem[] }[] = [];
    let currentSection: string | null = null;
    let bucket: MenuItem[] = [];
    menuItems.forEach((item, idx) => {
      if (item.section && item.section !== currentSection) {
        if (bucket.length) out.push({ section: currentSection, items: bucket });
        currentSection = item.section;
        bucket = [item];
      } else {
        bucket.push(item);
      }
      if (idx === menuItems.length - 1) out.push({ section: currentSection, items: bucket });
    });
    return out;
  }, [menuItems]);

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isExpanded ? 'w-56' : 'w-20'} ${className}`}>
      <div className="px-6 py-[22px] border-b border-gray-100">
        {isExpanded ? (
          <div className="flex items-center gap-1">
            <span className="text-blue-600">Dash</span>
            <span className="text-gray-800">Stack</span>
          </div>
        ) : (
          <div className="text-blue-600 text-center">DS</div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {grouped.map((group, gi) => (
          <div key={gi}>
            {group.section && isExpanded && <div className="px-6 py-2 text-xs text-gray-400 uppercase tracking-wider">{group.section}</div>}

            <div className={!isExpanded && group.section ? 'mt-4' : ''}>
              {group.items.map((item) => {
                const key = itemKey(item);
                const isActive = activeKey === key;

                // Prefer component prop; else map iconKey -> component; else undefined
                const IconComp: LucideIcon | undefined = item.icon ?? (item.iconKey ? iconMap[item.iconKey] : undefined);

                return (
                  <div key={key} className="px-3 py-1">
                    <button
                      onClick={() => handleClick(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                        ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}
                        ${!isExpanded ? 'justify-center' : ''}
                      `}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {IconComp ? <IconComp className="w-5 h-5 flex-shrink-0" /> : <span className="w-5 h-5" />}
                      {isExpanded && <span>{item.label}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
