import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
// Ikon diubah menggunakan 'Play' yang solid untuk tombol tengah
import { Home, ActivitySquare, User, Play, PlusCircle } from 'lucide-react';

const MobileLayout = () => {
  const location = useLocation();

  // Komponen Helper untuk menu navigasi reguler
  const NavItem = ({ name, path, icon }) => {
    const isActive = location.pathname === path || (path !== '/mobile' && location.pathname.startsWith(path));
    
    return (
      <Link
        to={path}
        className="flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors"
      >
        <div className={`${isActive ? 'text-purple-600' : 'text-slate-400'}`}>
          {/* Ikon diperkecil sedikit agar lebih proporsional ala iOS */}
          {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, size: 22 })}
        </div>
        <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold text-purple-600' : 'font-medium text-slate-400'}`}>
          {name}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28"> 
      
      {/* Area Konten Utama */}
      <main className="w-full max-w-md mx-auto relative h-full">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50">
        {/* iOS Style: Efek kaca (blur), shadow lembut, dan garis batas super tipis */}
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-t-[1.5rem] border-t border-slate-100/80 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] h-20 px-2 sm:px-6 relative flex justify-between items-center">
          
          {/* Menu Kiri */}
          <div className="flex justify-evenly flex-1 h-full pt-1">
            <NavItem name="Home" path="/mobile" icon={<Home />} />
            <NavItem name="Aktivitas" path="/mobile/activities" icon={<ActivitySquare />} />
          </div>

          {/* Tombol Tengah (Fokus Rekam) - Melayang (Floating) Clean iOS Style */}
          <div className="w-20 shrink-0 flex justify-center relative">
            {/* Posisi -top-9 menjaga tombol naik tapi memberi ruang luas di bawah untuk label */}
            <div className="absolute -top-9 flex flex-col items-center">
              <Link
                to="/mobile/record-run"
                className="flex flex-col items-center justify-center group"
              >
                {/* Ring pelindung warna putih untuk efek melengkung (cutout) yang tipis dan minimalis */}
                <div className="p-[6px] bg-white rounded-full shadow-[0_-4px_10px_rgba(0,0,0,0.02)] mb-1">
                  {/* Tombol Utama dengan gradien lembut khas modern app */}
                  <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(147,51,234,0.3)] text-white active:scale-90 transition-all duration-200">
                    {/* ml-1 digunakan untuk menyeimbangkan icon Play secara visual agar terlihat pas di tengah */}
                    <Play size={24} fill="currentColor" className="ml-1 text-white drop-shadow-sm" /> 
                  </div>
                </div>
                {/* Label dengan font-medium agar tetap clean */}
                <span className="text-[10px] font-medium text-slate-500">
                  Rekam
                </span>
              </Link>
            </div>
          </div>

          {/* Menu Kanan */}
          <div className="flex justify-evenly flex-1 h-full pt-1">
            <NavItem name="Tambah" path="/mobile/add-activity" icon={<PlusCircle />} />
            <NavItem name="Profil" path="/mobile/profile" icon={<User />} />
          </div>

        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;