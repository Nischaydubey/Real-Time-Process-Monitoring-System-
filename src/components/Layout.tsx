import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Cpu, HardDrive, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Layout({ children, darkMode, toggleDarkMode }: LayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Activity, label: 'Dashboard' },
    { path: '/processes', icon: Cpu, label: 'Processes' },
    { path: '/disk', icon: HardDrive, label: 'Disk Usage' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1A1F2E] text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 fixed h-full ${darkMode ? 'bg-[#1E2433]' : 'bg-gray-50'} p-4`}>
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold">System Monitor</h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-[#252B3B]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={toggleDarkMode}
            className={`mt-8 flex items-center gap-2 p-3 rounded-lg w-full ${
              darkMode ? 'bg-[#252B3B] text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}