import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useSelector } from 'store';

interface HeaderProps {
  className?: string;
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? '';
  return (first + second).toUpperCase() || 'U';
}

export default function Header({ className = '', onToggleSidebar, isSidebarExpanded = true }: HeaderProps) {
  const userInfo = useSelector((state) => state.user.userInfo);
  // If typed RootState:
  // const userInfo = useSelector((state: RootState) => state.user.userInfo);

  const { displayName, roleLabel, avatarUrl, initials } = useMemo(() => {
    const displayName = userInfo?.nickName ?? userInfo?.userName ?? 'Guest';

    const roleLabel = userInfo?.roles?.[0]?.roleName ?? userInfo?.roles?.[0]?.roleKey ?? 'User';

    const avatarUrl = userInfo?.avatar || '';
    const initials = getInitials(displayName);

    return { displayName, roleLabel, avatarUrl, initials };
  }, [userInfo]);

  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between ${className}`}>
      {/* Left side - Menu toggle and Search */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" aria-label="Toggle sidebar">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div> */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <button className="relative cursor-pointer hover:opacity-70 transition-opacity">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
        </button>

        <button className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
          <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-6 h-4 object-cover rounded" />
          <span className="text-gray-700">English</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* User Profile (dynamic) */}
        <button className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-semibold">{initials}</span>
            </div>
          )}

          <div className="text-left">
            <div className="text-gray-800">{displayName}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
