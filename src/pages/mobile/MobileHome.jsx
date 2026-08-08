import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Flame, Footprints, CalendarDays, Activity, Target, Trophy, Medal, Scale, TrendingDown, ArrowRight, Zap, ShieldPlus, BarChart2, Play, MapPin } from 'lucide-react';

const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse mt-4">
    <div className="bg-slate-900 h-48 rounded-[2rem] border border-slate-800 w-full"></div>
    <div className="flex gap-4">
      <div className="bg-slate-900 h-32 min-w-[140px] w-1/2 rounded-3xl border border-slate-800"></div>
      <div className="bg-slate-900 h-32 min-w-[140px] w-1/2 rounded-3xl border border-slate-800"></div>
    </div>
    <div className="grid grid-cols-4 gap-3 mt-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] border border-slate-800"></div>
          <div className="w-10 h-2 bg-slate-900 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

const MobileHome = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // STATE BARU: Untuk menyimpan nama lokasi dinamis
  const [locationName, setLocationName] = useState("Mencari lokasi...");
  
  const [userData, setUserData] = useState({ 
    name: 'Pelari', weeklyTarget: 30, height: 170, weight: 70, gender: 'L', mainTarget: 'speed'
  });
  
  const [weeklyStats, setWeeklyStats] = useState({ distance: 0, duration: 0, count: 0 });
  const [todayStats, setTodayStats] = useState({ distance: 0, duration: 0, calories: 0, steps: 0 });
  const [consistencyDays, setConsistencyDays] = useState([]);
  const [personalRecords, setPersonalRecords] = useState({ longestDist: 0, fastestPaceStr: "00:00", fastestPaceSec: 9999 });

  const profilePhoto = "https://i.pravatar.cc/150?img=11";
  const targetSteps = 10000;
  const progressPercentage = todayStats.steps > 0 ? (todayStats.steps / targetSteps) * 100 : 0;
  
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(animatedProgress, 100) / 100) * circumference;

  const calculateIdealWeight = (height, gender) => {
    const h = parseInt(height);
    if (!h) return 0;
    if (gender === 'P') return (h - 100) - ((h - 100) * 0.15);
    return (h - 100) - ((h - 100) * 0.1);
  };
  
  const idealWeight = calculateIdealWeight(userData.height, userData.gender);
  const runningScore = Math.min(Math.round(((weeklyStats.distance / userData.weeklyTarget) * 60) + ((weeklyStats.count / 4) * 40)), 100) || 0;

  // FUNGSI BARU: Mengambil Lokasi GPS Pengguna
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Menggunakan Nominatim API untuk Reverse Geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            if (data && data.address) {
              // Ambil kota, kabupaten, atau state terdekat
              const city = data.address.city || data.address.town || data.address.county || data.address.state || "LOKASI DITEMUKAN";
              // Hilangkan kata "Kota" atau "Kabupaten" agar lebih rapi
              const cleanName = city.replace(/Kota |Kabupaten /g, '').toUpperCase();
              setLocationName(cleanName);
            }
          } catch (error) {
            setLocationName("Sinyal Lemah");
          }
        },
        (error) => {
          setLocationName("Akses Lokasi Ditolak");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationName("GPS Tidak Didukung");
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      setUserData({
        name: savedProfile.name || 'Pelari',
        weeklyTarget: parseFloat(savedProfile.weeklyTarget) || 30,
        height: parseFloat(savedProfile.height) || 170,
        weight: parseFloat(savedProfile.weight) || 70,
        gender: savedProfile.gender || 'L',
        mainTarget: savedProfile.mainTarget || 'speed'
      });
    }

    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const sortedRuns = savedRuns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivities(sortedRuns);

    let maxDist = 0;
    let minPaceSec = 9999;
    let minPaceStr = "00:00";

    savedRuns.forEach(run => {
      if (run.distance > maxDist) maxDist = run.distance;
      if (run.avgPace && run.avgPace !== "00:00") {
        const parts = run.avgPace.split(':').map(Number);
        const paceSec = parts[0] * 60 + parts[1];
        if (paceSec > 0 && paceSec < minPaceSec) {
          minPaceSec = paceSec;
          minPaceStr = run.avgPace;
        }
      }
    });
    setPersonalRecords({ longestDist: maxDist, fastestPaceStr: minPaceStr, fastestPaceSec: minPaceSec });

    const today = new Date();
    const currentDay = today.getDay(); 
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let wDist = 0, wDur = 0, wCount = 0;
    let tDist = 0, tDur = 0, tCal = 0, tSteps = 0;

    savedRuns.forEach(run => {
      const runDate = new Date(run.date);
      
      if (runDate >= startOfWeek && runDate <= endOfWeek) {
        wDist += run.distance || 0;
        wDur += run.movingTime || 0;
        wCount++;
      }
      if (runDate.getFullYear() === today.getFullYear() && runDate.getMonth() === today.getMonth() && runDate.getDate() === today.getDate()) {
        tDist += run.distance || 0;
        tDur += run.movingTime || 0;
        tCal += run.calories || 0;
        tSteps += run.steps || 0;
      }
    });

    setWeeklyStats({ distance: wDist, duration: wDur, count: wCount });
    setTodayStats({ distance: tDist, duration: tDur, calories: tCal, steps: tSteps });

    const generateConsistency = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' }).charAt(0);
        
        let dailyDist = 0;
        let dailyDur = 0;
        let hasRun = false;

        savedRuns.forEach(run => {
          const runDate = new Date(run.date);
          runDate.setHours(0, 0, 0, 0);
          if (runDate.getTime() === d.getTime()) {
            hasRun = true;
            dailyDist += run.distance || 0;
            dailyDur += run.movingTime || 0;
          }
        });

        days.push({ day: dayName, date: d.getDate(), active: hasRun, isToday: i === 0, distance: dailyDist, duration: dailyDur });
      }
      return days;
    };

    setConsistencyDays(generateConsistency());

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const animTimer = setTimeout(() => setAnimatedProgress(progressPercentage), 1500);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(animTimer);
    };
  }, [progressPercentage]);

  return (
    <div className="pt-8 px-5 min-h-screen bg-slate-950 pb-24 font-sans text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER DENGAN LOKASI DINAMIS */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             <MapPin size={12} className="text-[#ccff00]" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
               {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {locationName}
             </p>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Halo, {userData.name}!</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] bg-slate-800">
            <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* IMPLEMENTASI SKELETON LOADER */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {/* 1. CAROUSEL MINGGUAN UTAMA */}
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">

            {/* TARGET MINGGUAN */}
            <div className="min-w-[85%] snap-center shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <Target size={18} className="text-[#ccff00]" />
                <h2 className="text-sm font-bold text-white">Target Mingguan</h2>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-4xl font-black tracking-tighter">{weeklyStats.distance.toFixed(1)} <span className="text-sm font-bold text-slate-500">/ {userData.weeklyTarget} km</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-[#ccff00] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(204,255,0,0.6)]" style={{ width: `${Math.min((weeklyStats.distance / userData.weeklyTarget) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">{(userData.weeklyTarget - weeklyStats.distance) > 0 ? `${(userData.weeklyTarget - weeklyStats.distance).toFixed(1)} km tersisa untuk target.` : 'Target mingguan tercapai! 🎉'}</p>
              </div>
            </div>
            
            {/* KONSISTENSI 7 HARI TERAKHIR */}
            <div className="min-w-[85%] snap-center shrink-0 bg-slate-900 rounded-3xl p-6 shadow-lg flex items-center gap-5 border border-slate-800">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r={35} stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle cx="40" cy="40" r={35} stroke="#ccff00" strokeWidth="8" fill="transparent" strokeDasharray={219} strokeDashoffset={219 - (Math.min(weeklyStats.count / 7, 1)) * 219} strokeLinecap="round" className="drop-shadow-[0_0_5px_rgba(204,255,0,0.5)]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-white">{Math.round((weeklyStats.count / 7) * 100)}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <CalendarDays size={16} className="text-[#ccff00]" />
                  <h2 className="text-xs font-bold text-white">Konsistensi</h2>
                </div>
                <div className="flex justify-between items-center w-full">
                  {consistencyDays.slice(2, 7).map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 relative group cursor-pointer">
                      <span className={`text-[9px] font-bold ${d.isToday ? 'text-[#ccff00]' : 'text-slate-500'}`}>{d.day}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${d.active ? 'bg-[#ccff00] text-slate-950 shadow-[0_0_8px_rgba(204,255,0,0.5)]' : (d.isToday ? 'border-2 border-[#ccff00]/50 text-[#ccff00] bg-slate-900' : 'text-slate-500 bg-slate-800')}`}>
                        {d.date}
                      </div>
                      {/* Tooltip */}
                      {d.active && (
                        <div className="absolute bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-active:opacity-100 group-active:visible transition-all duration-200 flex flex-col items-center bg-slate-800 text-white p-2 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                          <span className="text-xs font-black text-[#ccff00] mb-0.5">{d.distance.toFixed(1)} km</span>
                          <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1"><Clock size={10}/> {formatTimeStr(d.duration)}</span>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STATISTIK MINGGUAN */}
            <div className="min-w-[85%] snap-center shrink-0 bg-slate-900 rounded-3xl p-6 shadow-lg flex flex-col justify-between border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[#ccff00]" />
                <h2 className="text-sm font-bold text-white">Aktivitas Mingguan</h2>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-4xl font-black text-white tracking-tighter">{weeklyStats.distance.toFixed(1)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Kilometer</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{formatTimeStr(weeklyStats.duration)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Waktu Lari</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Route size={14} className="text-[#ccff00]" />
                <span>{weeklyStats.count} Total Aktivitas Minggu Ini</span>
              </div>
            </div>

            {/* RUNNING SCORE MINGGUAN */}
            <div className="min-w-[85%] snap-center shrink-0 bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Medal size={16} className="text-[#ccff00]" />
                  <h2 className="text-sm font-bold text-white">Running Score</h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Performa Minggu Ini</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#ccff00" strokeWidth="6" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (runningScore / 100) * 175} strokeLinecap="round" className="drop-shadow-[0_0_5px_rgba(204,255,0,0.5)]" />
                </svg>
                <span className="text-xl font-black text-white">{runningScore}</span>
              </div>
            </div>

          </div>

          {/* QUICK ACTIONS WIDGET */}
          <div className="mb-8 mt-2">
            <div className="grid grid-cols-4 gap-3">
              {[
                { title: 'Latihan', icon: Target, route: '/mobile/training', color: 'text-blue-400', bg: 'bg-blue-900/30 border border-blue-800' },
                { title: 'Recovery', icon: ShieldPlus, route: '/mobile/recovery', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border border-emerald-800' },
                { title: 'Statistik', icon: BarChart2, route: '/mobile/stats', color: 'text-purple-400', bg: 'bg-purple-900/30 border border-purple-800' },
                { title: 'Rekor', icon: Trophy, route: '/mobile/pr', color: 'text-amber-400', bg: 'bg-amber-900/30 border border-amber-800' }
              ].map((item, idx) => (
                <div key={idx} onClick={() => navigate(item.route)} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
                  <div className={`w-14 h-14 rounded-[1.25rem] ${item.bg} flex items-center justify-center shadow-lg`}>
                    <item.icon size={24} className={item.color} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. CAROUSEL DASHBOARD HARIAN */}
          <h2 className="text-sm font-bold text-white tracking-tight mb-3 px-1">Daily Dashboard</h2>
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">
            
            {/* KARTU 1: TARGET HARIAN */}
            <div className="w-[calc(100vw-40px)] snap-center shrink-0 bg-slate-900 rounded-3xl p-6 shadow-lg flex flex-col items-center border border-slate-800 relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 mt-2">Target Harian</p>
              <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r={radius} stroke="#1e293b" strokeWidth="12" fill="transparent" />
                  <circle cx="80" cy="80" r={radius} stroke="#ccff00" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <Footprints size={20} className="text-[#ccff00] mb-1 opacity-90" />
                  <span className="text-3xl font-black text-white tracking-tighter">{todayStats.steps.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Langkah</span>
                </div>
              </div>
              <div className="flex justify-between w-full px-2 pb-2">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Jarak</p>
                  <p className="font-black text-white text-lg">{todayStats.distance.toFixed(1)} <span className="text-xs text-slate-500 font-bold">km</span></p>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center justify-center gap-1"><Flame size={10} className="text-[#ccff00]"/> Kalori</p>
                  <p className="font-black text-white text-lg">{todayStats.calories} <span className="text-xs text-slate-500 font-bold">cal</span></p>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Waktu</p>
                  <p className="font-black text-white text-lg">{Math.floor(todayStats.duration / 60)} <span className="text-xs text-slate-500 font-bold">Min</span></p>
                </div>
              </div>
            </div>

            {/* KARTU 2: PROGRESS BERAT BADAN */}
            <div 
              onClick={() => navigate('/mobile/diet')}
              className="w-[calc(100vw-40px)] snap-center shrink-0 bg-slate-900 rounded-3xl p-6 shadow-lg flex flex-col border border-slate-800 justify-between cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="text-center">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 mt-2 flex items-center justify-center gap-1">
                   Diet & Berat Badan <ChevronRight size={14} className="text-[#ccff00]"/>
                 </p>
              </div>
              <div className="mt-2 mb-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Berat Saat Ini</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter">{userData.weight} <span className="text-lg font-bold text-slate-500 tracking-normal">kg</span></h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Ideal</p>
                    <h3 className="text-3xl font-black text-slate-300 tracking-tighter">{idealWeight.toFixed(1)} <span className="text-sm font-bold text-slate-500 tracking-normal">kg</span></h3>
                  </div>
                </div>

                <div className="relative pt-2 pb-6">
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-[#ccff00] h-full shadow-[0_0_8px_rgba(204,255,0,0.6)]" style={{ width: '65%' }}></div>
                   </div>
                   <div className="flex justify-between items-center mt-3">
                     <span className="text-[10px] font-bold text-slate-400">Sisa {Math.abs(userData.weight - idealWeight).toFixed(1)} kg lagi</span>
                     <span className="text-[10px] font-black text-slate-950 bg-[#ccff00] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]">On Track</span>
                   </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 flex items-center justify-between border border-slate-800 mt-auto">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-[#ccff00] border border-slate-700"><TrendingDown size={18}/></div>
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Defisit</p>
                     <p className="text-sm font-black text-white">-500 <span className="text-xs font-bold text-slate-500">kcal / hari</span></p>
                   </div>
                 </div>
              </div>
            </div>

          </div>

          {/* 3. PERSONAL RECORD TERBARU & CHALLENGE */}
          <h2 className="text-sm font-bold text-white tracking-tight mb-3 px-1 mt-2">Personal Records</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-center">
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-[#ccff00]">
                 <Trophy size={18} />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Terjauh (PR)</p>
               <h3 className="text-2xl font-black text-white tracking-tighter">{personalRecords.longestDist.toFixed(2)} <span className="text-sm font-bold text-slate-500 tracking-normal">km</span></h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-center">
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-orange-500">
                 <Zap size={18} />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tercepat (PR)</p>
               <h3 className="text-2xl font-black text-white tracking-tighter">{personalRecords.fastestPaceStr} <span className="text-sm font-bold text-slate-500 tracking-normal">/km</span></h3>
            </div>
          </div>

          {/* CHALLENGE BANNER */}
          <div 
            onClick={() => navigate('/mobile/challenges')} // Rute menuju daftar tantangan (gamifikasi)
            className="bg-slate-900 rounded-3xl p-5 mb-8 shadow-lg border border-slate-800 flex items-center justify-between relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
          >
             <div>
               <div className="flex items-center gap-1.5 mb-1">
                 <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_8px_rgba(204,255,0,0.8)]"></span>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">Challenge Berjalan</p>
               </div>
               <h3 className="text-white font-black text-sm tracking-wide mt-1">100KM Monthly Push</h3>
               <p className="text-xs font-bold text-slate-400 mt-1">24.5 km selesai • 20 hari tersisa</p>
             </div>
             <div className="w-10 h-10 bg-[#ccff00] rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
               <ArrowRight size={18} />
             </div>
          </div>

          {/* 4. AKTIVITAS TERBARU (DENGAN IMPLEMENTASI EMPTY STATES) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-5 px-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Aktivitas Terbaru</h2>
              <button onClick={() => navigate('/mobile/activities')} className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">Lihat Semua</button>
            </div>

            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                // IMPLEMENTASI EMPTY STATE MOTIVASIONAL
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-lg flex flex-col items-center justify-center text-center mt-2 mx-1">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-5 relative border border-slate-700">
                    <div className="absolute inset-0 border border-[#ccff00]/30 rounded-full animate-ping"></div>
                    <Footprints size={28} className="text-[#ccff00]" />
                  </div>
                  <h4 className="text-base font-black text-white mb-2">Belum Ada Catatan Lari</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6 px-2">
                    Lari pertamamu adalah langkah awal menuju versi terbaik dirimu. Sepatu sudah siap?
                  </p>
                  <button 
                    onClick={() => navigate('/mobile/record-run')}
                    className="bg-[#ccff00] text-slate-950 font-black px-6 py-3.5 rounded-full text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  >
                    <Play size={14} fill="currentColor" /> Mulai Lari Sekarang
                  </button>
                </div>
              ) : (
                recentActivities.slice(0, 3).map((activity) => {
                  const runDate = new Date(activity.date);
                  const dateString = runDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  
                  return (
                    <div key={activity.id} onClick={() => navigate(`/mobile/activity/${activity.id}`)} className="bg-slate-900 rounded-3xl p-4 shadow-lg border border-slate-800 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Map size={20} className="text-[#ccff00]" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-sm tracking-wide">{activity.title || getDynamicTitle(activity.date)}</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{dateString} • {activity.calories || 0} kkal</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-500" />
                      </div>

                      <div className="bg-slate-950 rounded-2xl p-3 flex justify-between items-center px-4 border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Route size={14} className="text-slate-500"/><p className="text-xs font-black text-white">{(activity.distance || 0).toFixed(2)} <span className="font-bold text-slate-500">km</span></p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-1.5">
                          <Flame size={14} className="text-slate-500"/><p className="text-xs font-black text-white">{activity.avgPace}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-500"/><p className="text-xs font-black text-white">{Math.floor((activity.movingTime || 0) / 60)} <span className="font-bold text-slate-500">mnt</span></p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHome;