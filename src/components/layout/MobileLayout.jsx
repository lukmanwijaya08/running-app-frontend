import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ActivitySquare, User, PlayCircle } from 'lucide-react';

const MobileLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/mobile', icon: <Home size={24} /> },
    { name: 'Aktivitas', path: '/mobile/activities', icon: <ActivitySquare size={24} /> },
    { name: 'Rekam', path: '/mobile/record-run', icon: <PlayCircle size={24} /> },
    { name: 'Profil', path: '/mobile/profile', icon: <User size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24"> 
      
      {/* Area Konten Utama */}
      <main className="w-full max-w-md mx-auto relative h-full">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-6">
          {navItems.map((item) => {
            // Logika aktif: jika di /mobile tepat, atau jika di sub-path (kecuali /mobile itu sendiri)
            const isActive = location.pathname === item.path || 
                             (item.path !== '/mobile' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-16 h-full gap-1.5 transition-colors"
              >
                <div className={`${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                  {React.cloneElement(item.icon, { strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;