import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award, Map, Clock, Zap, TrendingUp, Crown, Star, Route } from 'lucide-react';

const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const parsePaceToSec = (paceStr) => {
  if (!paceStr || paceStr === "00:00") return 0;
  const parts = paceStr.split(':').map(Number);
  return (parts[0] * 60) + (parts[1] || 0);
};

const MobilePR = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState({ longestDist: 0, longestTime: 0, bestPace: "00:00", maxElevation: 0 });
  const [bestEfforts, setBestEfforts] = useState({ '1k': null, '5k': null, '10k': null, '21k': null });
  const [earnedBadges, setEarnedBadges] = useState([]);

  // Kustomisasi palet warna Badge agar sesuai dengan tema gelap
  const ALL_BADGES = [
    { id: 'first_run', name: 'Langkah Pertama', desc: 'Menyelesaikan lari pertama Anda.', icon: Map, color: 'text-blue-400', bg: 'bg-blue-900/30 border border-blue-800' },
    { id: '5k_finisher', name: '5K Finisher', desc: 'Berhasil menempuh jarak 5 KM.', icon: Medal, color: 'text-emerald-400', bg: 'bg-emerald-900/30 border border-emerald-800' },
    { id: '10k_finisher', name: '10K Finisher', desc: 'Berhasil menempuh jarak 10 KM.', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-900/30 border border-purple-800' },
    { id: '100k_club', name: '100KM Club', desc: 'Total jarak tempuh mencapai 100 KM.', icon: Crown, color: 'text-[#ccff00]', bg: 'bg-[#ccff00]/10 border border-[#ccff00]/30' },
    { id: 'early_bird', name: 'Early Bird', desc: 'Lari pagi sebelum jam 6 pagi.', icon: Star, color: 'text-orange-400', bg: 'bg-orange-900/30 border border-orange-800' },
  ];

  useEffect(() => {
    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    let maxD = 0, maxT = 0, maxE = 0, minPaceSec = 9999, minPaceStr = "00:00", totalDist = 0, hasEarlyRun = false;
    let best1k = 99999, best5k = 99999, best10k = 99999, best21k = 99999;
    
    savedRuns.forEach(run => {
      if (run.distance > maxD) maxD = run.distance;
      if (run.movingTime > maxT) maxT = run.movingTime;
      if (run.elevation > maxE) maxE = run.elevation;
      const paceSec = parsePaceToSec(run.avgPace);
      if (paceSec > 0 && paceSec < minPaceSec) { minPaceSec = paceSec; minPaceStr = run.avgPace; }
      totalDist += (run.distance || 0);
      const runHour = new Date(run.date).getHours();
      if (runHour >= 4 && runHour < 6) hasEarlyRun = true;
      if (paceSec > 0) {
        if (run.distance >= 1 && paceSec * 1 < best1k) best1k = paceSec * 1;
        if (run.distance >= 5 && paceSec * 5 < best5k) best5k = paceSec * 5;
        if (run.distance >= 10 && paceSec * 10 < best10k) best10k = paceSec * 10;
        if (run.distance >= 21.1 && paceSec * 21.1 < best21k) best21k = paceSec * 21.1;
      }
    });

    setRecords({ longestDist: maxD, longestTime: maxT, bestPace: minPaceStr, maxElevation: maxE });
    setBestEfforts({ '1k': best1k === 99999 ? null : best1k, '5k': best5k === 99999 ? null : best5k, '10k': best10k === 99999 ? null : best10k, '21k': best21k === 99999 ? null : best21k });

    const earned = [];
    if (savedRuns.length > 0) earned.push('first_run');
    if (maxD >= 5) earned.push('5k_finisher');
    if (maxD >= 10) earned.push('10k_finisher');
    if (totalDist >= 100) earned.push('100k_club');
    if (hasEarlyRun) earned.push('early_bird');
    setEarnedBadges(earned);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold tracking-tight">Personal Record</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 px-5 space-y-6">
        
        {/* HERO SECTION */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-full flex items-center justify-center mb-4 z-10">
            <Trophy size={28} className="text-[#ccff00]" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight mb-1 z-10">Ruang Piala Anda</h2>
          <p className="text-xs font-medium text-slate-400 mb-5 leading-relaxed px-4 z-10">Merayakan setiap keringat, pencapaian, dan rekor terbaik Anda.</p>
          
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-5 py-2.5 rounded-xl z-10">
            <Award size={16} className="text-[#ccff00]" />
            <span className="text-xs font-bold text-white">{earnedBadges.length} Medali Terkumpul</span>
          </div>
        </div>

        {/* 1. REKOR AKTIVITAS TUNGGAL (ALL-TIME BESTS) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-4 px-1">Rekor Tertinggi (All-Time)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"><Route size={14} className="text-blue-400" /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terjauh</p>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{records.longestDist.toFixed(2)} <span className="text-[10px] font-bold text-slate-500 tracking-normal">km</span></h3>
            </div>

            <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"><Clock size={14} className="text-orange-400" /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terlama</p>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{formatTimeStr(records.longestTime)}</h3>
            </div>

            <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"><Zap size={14} className="text-[#ccff00]" /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pace Terbaik</p>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{records.bestPace} <span className="text-[10px] font-bold text-slate-500 tracking-normal">/km</span></h3>
            </div>

            <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"><TrendingUp size={14} className="text-emerald-400" /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Elevasi Maks</p>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{records.maxElevation} <span className="text-[10px] font-bold text-slate-500 tracking-normal">m</span></h3>
            </div>
          </div>
        </div>

        {/* 2. WAKTU TERCEPAT (BEST EFFORTS) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-4 px-1">Waktu Tercepat (Best Efforts)</h3>
          <div className="bg-slate-900 rounded-[2rem] p-2 shadow-lg border border-slate-800">
            {[
              { label: '1 Kilometer', key: '1k', default: '05:30' },
              { label: '5 Kilometer', key: '5k', default: '28:45' },
              { label: '10 Kilometer', key: '10k', default: '59:20' },
              { label: 'Half Marathon', key: '21k', default: '--:--:--' },
            ].map((effort, index, arr) => (
              <div key={effort.key} className={`flex items-center justify-between p-4 ${index !== arr.length - 1 ? 'border-b border-slate-800' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                    <Medal size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-white">{effort.label}</h4>
                </div>
                <span className="text-base font-black text-[#ccff00] tracking-tight">
                  {bestEfforts[effort.key] ? formatTimeStr(bestEfforts[effort.key]) : effort.default}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. KOLEKSI MEDALI (BADGES) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-4 px-1">Koleksi Medali</h3>
          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.map(badge => {
              const isEarned = earnedBadges.includes(badge.id);
              const BadgeIcon = badge.icon;
              
              return (
                <div key={badge.id} className={`rounded-2xl p-4 flex flex-col items-start transition-all ${
                  isEarned ? `bg-slate-900 border border-slate-800 shadow-lg` : 'bg-slate-950 border border-slate-900 opacity-60 grayscale'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isEarned ? badge.bg : 'bg-slate-800 border border-slate-700'}`}>
                    <BadgeIcon size={18} className={isEarned ? badge.color : 'text-slate-500'} />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{badge.name}</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobilePR;