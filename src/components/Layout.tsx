import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  PackageSearch,
  ClipboardList,
  Container,
  Gauge,
  Package,
  Fuel,
  FileText,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'raw-material', label: 'Raw Material KYC', icon: PackageSearch },
  { id: 'composition-planning', label: 'Composition Planning', icon: ClipboardList },
  { id: 'surge-bunker', label: 'Surge Bunker', icon: Container },
  { id: 'ppt-reading', label: 'PPT Reading', icon: Gauge },
  { id: 'finished-good', label: 'Finished Good', icon: Package },
  { id: 'fuel', label: 'Fuel Consumption', icon: Fuel },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function Layout({ children, currentPage, onNavigate, onLogout, userName }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const normalizedCurrent = String(currentPage || '').toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header removed as requested */}

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col`}
        >
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = normalizedCurrent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="px-3 py-4 border-t border-gray-100 mb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-medium">{String(userName || '').charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
              </div>
              <button
                onClick={() => onLogout()}
                aria-label="Logout"
                className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-hidden flex flex-col lg:ml-64">
          <div className="flex-1 overflow-y-auto pb-20">
            {children}
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 lg:pl-64 z-50 shadow-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Powered By{' '}
            <a
              href="https://www.botivate.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Botivate
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
