import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Plus, Flame, Footprints, CalendarDays, Activity, Target } from 'lucide-react';

const MobileHome = () => {
  const navigate = useNavigate();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Menarik foto yang sama dengan profil (Idealnya dari Redux/Context, ini simulasi)
  const profilePhoto = "https://i.pravatar.cc/150?img=11";

  const weekDays = [
    { day: 'S', date: 20, active: false }, { day: 'S', date: 21, active: false },
    { day: 'R', date: 22, active: false }, { day: 'K', date: 23, active: false },
    { day: 'J', date: 24, active: true }, { day: 'S', date: 25, active: false },
    { day: 'M', date: 26, active: false },
  ];

  // Data lebih dari 3 untuk menguji pembatasan slice(0,3)
  const recentActivities = [
    { id: 1, title: 'Morning Run Semarang', description: 'Lari santai', distance: '5.2 km', pace: '06:15', time: '32:30', date: 'Hari ini', iconColor: 'text-purple-600', bgIcon: 'bg-purple-50' },
    { id: 2, title: 'Night Speed Workout', description: 'Interval', distance: '8.0 km', pace: '05:30', time: '44:00', date: 'Kemarin', iconColor: 'text-orange-500', bgIcon: 'bg-orange-50' },
    { id: 3, title: 'Sunday Long Run', description: 'Endurance', distance: '15.5 km', pace: '06:45', time: '01:45:00', date: '20 Jul', iconColor: 'text-purple-600', bgIcon: 'bg-purple-50' },
    { id: 4, title: 'Recovery Jog', description: 'Pegal-pegal', distance: '3.0 km', pace: '07:20', time: '22:00', date: '18 Jul', iconColor: 'text-purple-600', bgIcon: 'bg-purple-50' },
  ];

  const targetSteps = 15000;
  const currentSteps = 11857;
  const progressPercentage = (currentSteps / targetSteps) * 100;
  
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progressPercentage), 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div className="pt-8 px-5">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">Jumat, 24 Juli • Semarang</p>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Halo, Lukman!</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/mobile/add-activity')} 
            className="w-11 h-11 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md shadow-purple-200 active:scale-95 transition-transform"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
          <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* CAROUSEL KARTU */}
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">
        <div className="min-w-[85%] snap-center shrink-0 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-700">Aktivitas Mingguan</h2>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-semibold text-slate-800 tracking-tight">24.5</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Kilometer</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-800">02:15:30</p>
              <p className="text-xs font-medium text-slate-400">Waktu Lari</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Route size={14} className="text-purple-500" />
            <span>4 Total Aktivitas Minggu Ini</span>
          </div>
        </div>

        <div className="min-w-[85%] snap-center shrink-0 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5 border border-slate-50">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={35} stroke="#f8fafc" strokeWidth="8" fill="transparent" />
              <circle cx="40" cy="40" r={35} stroke="#9333ea" strokeWidth="8" fill="transparent" strokeDasharray={219} strokeDashoffset={219 - (79 / 100) * 219} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-slate-800">79%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2.5">
              <CalendarDays size={16} className="text-orange-400" />
              <h2 className="text-xs font-semibold text-slate-700">Konsistensi</h2>
            </div>
            <div className="flex justify-between items-center w-full">
              {weekDays.slice(0, 5).map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-medium text-slate-400">{d.day}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${d.active ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'text-slate-500 bg-slate-50'}`}>
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-[85%] snap-center shrink-0 bg-purple-600 rounded-3xl p-6 shadow-md shadow-purple-200 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Target size={18} className="text-purple-200" />
            <h2 className="text-sm font-semibold text-purple-50">Target Mingguan</h2>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-semibold tracking-tight">24.5 <span className="text-sm font-medium text-purple-200">/ 30 km</span></span>
            </div>
            <div className="h-2 w-full bg-purple-900/40 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '81%' }}></div>
            </div>
            <p className="text-xs font-medium text-purple-100 mt-3">Sedikit lagi! 5.5 km tersisa untuk target.</p>
          </div>
        </div>
      </div>

      {/* TARGET HARIAN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex flex-col items-center relative overflow-hidden border border-slate-50">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
        <h2 className="text-xs font-medium text-slate-400 mb-6">Target Harian</h2>
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r={radius} stroke="#f8fafc" strokeWidth="12" fill="transparent" />
            <circle cx="96" cy="96" r={radius} stroke="#9333ea" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <Footprints size={20} className="text-orange-400 mb-1 opacity-90" />
            <span className="text-3xl font-semibold text-slate-800 tracking-tight">11,857</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Langkah</span>
          </div>
        </div>
        <div className="flex justify-between w-full px-4">
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1">Jarak</p>
            <p className="font-semibold text-slate-700">8.2 <span className="text-xs text-slate-400 font-normal">km</span></p>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-center gap-1"><Flame size={10} className="text-orange-400"/> Kalori</p>
            <p className="font-semibold text-slate-700">1,325 <span className="text-xs text-slate-400 font-normal">cal</span></p>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1">Waktu</p>
            <p className="font-semibold text-slate-700">47.5 <span className="text-xs text-slate-400 font-normal">Min</span></p>
          </div>
        </div>
      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Aktivitas Terbaru</h2>
          {/* Navigasi Lihat Semua */}
          <button onClick={() => navigate('/mobile/activities')} className="text-xs font-medium text-purple-600">Lihat Semua</button>
        </div>

        <div className="space-y-4">
          {/* Batasi hanya 3 data terbaru menggunakan slice(0,3) */}
          {recentActivities.slice(0, 3).map((activity) => (
            <div key={activity.id} onClick={() => navigate(`/mobile/activity/${activity.id}`)} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${activity.bgIcon} flex items-center justify-center`}>
                    <Map size={20} className={activity.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{activity.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.date} • {activity.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center px-4">
                <div className="flex items-center gap-1.5">
                  <Route size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.distance}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.pace}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;