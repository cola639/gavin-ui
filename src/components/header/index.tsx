import { Bell, ChevronDown, Menu, Search } from 'lucide-react';

interface HeaderProps {
  className?: string;
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
}

export default function Header({ className = '', onToggleSidebar, isSidebarExpanded = true }: HeaderProps) {
  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between ${className}`}>
      {/* Left side - Menu toggle and Search */}
      <div className="flex items-center gap-4">
        {/* Menu Toggle Button */}
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="Toggle sidebar">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>
      </div>

      {/* Right side - Notifications, Language, User */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative cursor-pointer hover:opacity-70 transition-opacity">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
        </button>

        {/* Language Selector */}
        <button className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
          <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-6 h-4 object-cover rounded" />
          <span className="text-gray-700">English</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-white">MR</span>
          </div>
          <div className="text-left">
            <div className="text-gray-800">Moni Roy</div>
            <div className="text-gray-500 text-sm">Admin</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  );
}
