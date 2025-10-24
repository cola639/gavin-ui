import Header from '@/components/header';
import Sidebar, { MenuItem } from '@/components/sidebar';
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
  List,
  LogOut,
  Menu,
  Package,
  Settings,
  Table,
  UserPlus,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function App() {
  const [showExpanded, setShowExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState('logout');

  // Define menu items array - this can be passed as props
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'order-lists', label: 'Order Lists', icon: List },
    { id: 'product-stock', label: 'Product Stock', icon: Archive },

    // PAGES section
    { id: 'pricing', label: 'Pricing', icon: DollarSign, section: 'PAGES' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'to-do', label: 'To-Do', icon: CheckSquare },
    { id: 'contact', label: 'Contact', icon: Users },
    { id: 'invoice', label: 'Invoice', icon: FileText },
    { id: 'ui-elements', label: 'UI Elements', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: UserPlus },
    { id: 'table', label: 'Table', icon: Table },

    // Bottom items
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const handleMenuClick = (menuId: string) => {
    console.log('Menu clicked:', menuId);
    setActiveMenu(menuId);
    // Handle navigation here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} isExpanded={showExpanded} onMenuClick={handleMenuClick} activeMenuId={activeMenu} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onToggleSidebar={() => setShowExpanded(!showExpanded)} isSidebarExpanded={showExpanded} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
