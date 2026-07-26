import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Flame, Footprints, CalendarDays, Activity, Target } from 'lucide-react';

const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

const MobileHome = () => {
  const navigate = useNavigate();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // State untuk Data Pribadi & Statistik
  const [userData, setUserData] = useState({ name: 'Lukman', weeklyTarget: 30 });
  const [weeklyStats, setWeeklyStats] = useState({ distance: 0, duration: 0, count: 0 });
  const [todayStats, setTodayStats] = useState({ distance: 0, duration: 0, calories: 0, steps: 0 });
  const [consistencyDays, setConsistencyDays] = useState([]);

  const profilePhoto = "https://i.pravatar.cc/150?img=11";

  // Target Harian Statis (Misal target: 10000 langkah)
  const targetSteps = 10000;
  const progressPercentage = todayStats.steps > 0 ? (todayStats.steps / targetSteps) * 100 : 0;
  
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(animatedProgress, 100) / 100) * circumference;

  useEffect(() => {
    // 1. Ambil Profil User
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      setUserData({
        name: savedProfile.name || 'Pelari',
        weeklyTarget: parseFloat(savedProfile.weeklyTarget) || 30
      });
    }

    // 2. Ambil Riwayat Lari
    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    setRecentActivities(savedRuns);

    // 3. Kalkulasi Waktu & Statistik
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Hitung awal minggu (Senin)
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    let wDist = 0, wDur = 0, wCount = 0;
    let tDist = 0, tDur = 0, tCal = 0, tSteps = 0;

    savedRuns.forEach(run => {
      const runDate = new Date(run.date);
      // Analitik Mingguan
      if (runDate >= startOfWeek) {
        wDist += run.distance || 0;
        wDur += run.movingTime || 0;
        wCount++;
      }
      // Analitik Harian
      if (runDate.toDateString() === today.toDateString()) {
        tDist += run.distance || 0;
        tDur += run.movingTime || 0;
        tCal += run.calories || 0;
        tSteps += run.steps || 0;
      }
    });

    setWeeklyStats({ distance: wDist, duration: wDur, count: wCount });
    setTodayStats({ distance: tDist, duration: tDur, calories: tCal, steps: tSteps });

    // 4. Kalkulasi Kalender Konsistensi (7 Hari Terakhir)
    const generateConsistency = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        // Ambil inisial hari (S, S, R, K, J, S, M)
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' }).charAt(0);
        
        // Cek apakah ada lari di hari tersebut
        const hasRun = savedRuns.some(run => {
          const runDate = new Date(run.date);
          runDate.setHours(0, 0, 0, 0);
          return runDate.getTime() === d.getTime();
        });

        days.push({ day: dayName, date: d.getDate(), active: hasRun, isToday: i === 0 });
      }
      return days;
    };

    setConsistencyDays(generateConsistency());

    // 5. Animasi Chart
    const timer = setTimeout(() => setAnimatedProgress(progressPercentage), 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  return (
    <div className="pt-8 px-5">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} • Semarang</p>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Halo, {userData.name}!</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* CAROUSEL KARTU */}
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">
        
        {/* STATISTIK MINGGUAN */}
        <div className="min-w-[85%] snap-center shrink-0 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-700">Aktivitas Mingguan</h2>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-semibold text-slate-800 tracking-tight">{weeklyStats.distance.toFixed(1)}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Kilometer</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-800">{formatTimeStr(weeklyStats.duration)}</p>
              <p className="text-xs font-medium text-slate-400">Waktu Lari</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Route size={14} className="text-purple-500" />
            <span>{weeklyStats.count} Total Aktivitas Minggu Ini</span>
          </div>
        </div>

        {/* KONSISTENSI 7 HARI TERAKHIR (DINAMIS) */}
        <div className="min-w-[85%] snap-center shrink-0 bg-white rounded-3xl p-6 shadow-sm flex items-center gap-5 border border-slate-50">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={35} stroke="#f8fafc" strokeWidth="8" fill="transparent" />
              <circle cx="40" cy="40" r={35} stroke="#9333ea" strokeWidth="8" fill="transparent" strokeDasharray={219} strokeDashoffset={219 - (Math.min(weeklyStats.count / 7, 1)) * 219} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-slate-800">{Math.round((weeklyStats.count / 7) * 100)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2.5">
              <CalendarDays size={16} className="text-orange-400" />
              <h2 className="text-xs font-semibold text-slate-700">Konsistensi</h2>
            </div>
            <div className="flex justify-between items-center w-full">
              {consistencyDays.slice(2, 7).map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[9px] font-medium ${d.isToday ? 'text-purple-600' : 'text-slate-400'}`}>{d.day}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${d.active ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : (d.isToday ? 'border border-purple-200 text-purple-600 bg-purple-50' : 'text-slate-500 bg-slate-50')}`}>
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TARGET MINGGUAN (DINAMIS DARI PROFIL) */}
        <div className="min-w-[85%] snap-center shrink-0 bg-purple-600 rounded-3xl p-6 shadow-md shadow-purple-200 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Target size={18} className="text-purple-200" />
            <h2 className="text-sm font-semibold text-purple-50">Target Mingguan</h2>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-semibold tracking-tight">{weeklyStats.distance.toFixed(1)} <span className="text-sm font-medium text-purple-200">/ {userData.weeklyTarget} km</span></span>
            </div>
            <div className="h-2 w-full bg-purple-900/40 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min((weeklyStats.distance / userData.weeklyTarget) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs font-medium text-purple-100 mt-3">{(userData.weeklyTarget - weeklyStats.distance) > 0 ? `${(userData.weeklyTarget - weeklyStats.distance).toFixed(1)} km tersisa untuk target.` : 'Target mingguan tercapai! 🎉'}</p>
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
            <span className="text-3xl font-semibold text-slate-800 tracking-tight">{todayStats.steps.toLocaleString('id-ID')}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Langkah</span>
          </div>
        </div>
        <div className="flex justify-between w-full px-4">
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1">Jarak</p>
            <p className="font-semibold text-slate-700">{todayStats.distance.toFixed(1)} <span className="text-xs text-slate-400 font-normal">km</span></p>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center justify-center gap-1"><Flame size={10} className="text-orange-400"/> Kalori</p>
            <p className="font-semibold text-slate-700">{todayStats.calories} <span className="text-xs text-slate-400 font-normal">cal</span></p>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-1">Waktu</p>
            <p className="font-semibold text-slate-700">{Math.floor(todayStats.duration / 60)} <span className="text-xs text-slate-400 font-normal">Min</span></p>
          </div>
        </div>
      </div>

      {/* AKTIVITAS TERBARU */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Aktivitas Terbaru</h2>
          <button onClick={() => navigate('/mobile/activities')} className="text-xs font-medium text-purple-600">Lihat Semua</button>
        </div>

        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center text-slate-400 text-sm border border-slate-50">Belum ada aktivitas terekam.</div>
          ) : (
            recentActivities.slice(0, 3).map((activity) => {
              const runDate = new Date(activity.date);
              const dateString = runDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              
              return (
                <div key={activity.id} onClick={() => navigate(`/mobile/activity/${activity.id}`)} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Map size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{getDynamicTitle(activity.date)}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{dateString} • {activity.calories || 0} kkal</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center px-4">
                    <div className="flex items-center gap-1.5">
                      <Route size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{(activity.distance || 0).toFixed(2)} km</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.avgPace}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{Math.floor((activity.movingTime || 0) / 60)} mnt</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHome;