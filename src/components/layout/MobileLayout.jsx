import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ActivitySquare, User, PlusCircle } from 'lucide-react';

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
        {/* Teks & Ikon aktif diubah menjadi warna Volt (Kuning Neon), inaktif menjadi abu-abu redup */}
        <div className={`${isActive ? 'text-[#ccff00]' : 'text-slate-400'}`}>
          {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, size: 22 })}
        </div>
        <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold text-[#ccff00]' : 'font-medium text-slate-400'}`}>
          {name}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-28"> 
      
      {/* Area Konten Utama */}
      <main className="w-full max-w-md mx-auto relative h-full">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50">
        {/* Tema Midnight: Latar belakang gelap (slate-900) dengan border tipis elegan */}
        <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-md rounded-t-[1.5rem] border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] h-20 px-2 sm:px-6 relative flex justify-between items-center">
          
          {/* Menu Kiri */}
          <div className="flex justify-evenly flex-1 h-full pt-1">
            <NavItem name="Home" path="/mobile" icon={<Home />} />
            <NavItem name="Aktivitas" path="/mobile/activities" icon={<ActivitySquare />} />
          </div>

          {/* Tombol Tengah (Fokus Rekam) - Melayang (Floating) */}
          <div className="w-20 shrink-0 flex justify-center relative">
            <div className="absolute -top-9 flex flex-col items-center">
              <Link
                to="/mobile/record-run"
                className="flex flex-col items-center justify-center group"
              >
                {/* Ring pelindung warna gelap (slate-900) menyatu dengan background */}
                <div className="p-[6px] bg-slate-900 rounded-full shadow-[0_-4px_10px_rgba(0,0,0,0.1)] mb-1">
                  
                  {/* Tombol Utama: Warna Volt (Kuning Neon) menyala */}
                  <div className="w-14 h-14 bg-[#ccff00] rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(204,255,0,0.2)] active:scale-90 transition-all duration-200">
                    
                    {/* Ikon Orang Lari berwarna hitam (Midnight) agar kontras di atas kuning */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-slate-900 drop-shadow-sm ml-0.5">
                      <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
                    </svg>
                  </div>
                  
                </div>
                {/* Label dengan warna terang agar terbaca di atas background gelap */}
                <span className="text-[10px] font-medium text-slate-300">
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