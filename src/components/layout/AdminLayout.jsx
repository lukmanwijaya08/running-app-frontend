import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ActivitySquare, 
  Settings, 
  Database,
  TerminalSquare,
  LogOut
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { title: 'Manajemen User', path: '/admin/users', icon: <Users size={20} /> },
    { title: 'Manajemen Aktivitas', path: '/admin/activities', icon: <ActivitySquare size={20} /> },
    { title: 'Prompt AI & Sistem', path: '/admin/ai-settings', icon: <TerminalSquare size={20} /> },
    { title: 'Monitoring Storage', path: '/admin/storage', icon: <Database size={20} /> },
    { title: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">RunApp Admin</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full px-3 py-2.5 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Opsional, untuk info user yang login) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin Utama</p>
              <p className="text-xs text-gray-500">admin@runapp.com</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Content (Outlet) */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;