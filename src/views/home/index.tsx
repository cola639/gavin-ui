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
          {/* Simple placeholder content */}
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="mb-4">Main Content Area</h1>
            <p className="text-gray-600 mb-4">
              Currently viewing: <strong>{activeMenu}</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-blue-700 mb-2">Total Sales</h3>
                <p className="text-gray-600">$45,231.89</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-green-700 mb-2">New Customers</h3>
                <p className="text-gray-600">+2,350</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-purple-700 mb-2">Active Orders</h3>
                <p className="text-gray-600">573</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
