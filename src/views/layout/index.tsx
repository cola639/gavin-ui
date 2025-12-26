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
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const menuItems: MenuItem[] = useSelector((state: any) => state.routes.menu);
  const [showExpanded, setShowExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState('logout');

  // Define menu items array - this can be passed as props
  // const menuItems: MenuItem[] = [
  //   { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  //   { id: 'products', label: 'Products', icon: Package },
  //   { id: 'favorites', label: 'Favorites', icon: Heart },

  //   // PAGES section
  //   { id: 'pricing', label: 'Pricing', icon: DollarSign, section: 'PAGES' },
  //   { id: 'calendar', label: 'Calendar', icon: Calendar },
  //   { id: 'to-do', label: 'To-Do', icon: CheckSquare },
  //   { id: 'contact', label: 'Contact', icon: Users },
  //   { id: 'invoice', label: 'Invoice', icon: FileText },
  //   { id: 'ui-elements', label: 'UI Elements', icon: BarChart3 },
  //   { id: 'team', label: 'Team', icon: UserPlus },
  //   { id: 'table', label: 'Table', icon: Table },

  // ];

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    // Handle navigation here
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar menuItems={menuItems} isExpanded={showExpanded} onMenuClick={handleMenuClick} />

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
