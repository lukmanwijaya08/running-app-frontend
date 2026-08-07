import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Flame, Footprints, TrendingUp, Zap, Activity, Trophy, Calendar, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "0 j 0 m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} j ${m} m`;
  return `${m} mnt`;
};

const formatPaceFromSec = (secondsPerKm) => {
  if (!isFinite(secondsPerKm) || secondsPerKm === 0) return "00:00";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const parsePaceToSec = (paceStr) => {
  if (!paceStr || paceStr === "00:00") return 0;
  const parts = paceStr.split(':').map(Number);
  return (parts[0] * 60) + (parts[1] || 0);
};

const MobileStats = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Mingguan'); 
  const [allRuns, setAllRuns] = useState([]);
  const [stats, setStats] = useState({ distance: 0, duration: 0, steps: 0, calories: 0, elevation: 0, avgPaceSec: 0, bestPaceSec: 9999, maxSpeed: 0, totalActivities: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    setAllRuns(savedRuns);
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const filteredRuns = allRuns.filter(run => {
      const runDate = new Date(run.date);
      if (activeTab === 'Mingguan') {
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1; 
        startOfWeek.setDate(today.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);
        return runDate >= startOfWeek && runDate <= today;
      }
      if (activeTab === 'Bulanan') { return runDate.getMonth() === today.getMonth() && runDate.getFullYear() === today.getFullYear(); }
      if (activeTab === 'Tahunan') { return runDate.getFullYear() === today.getFullYear(); }
      return true; 
    });

    let dist = 0, dur = 0, steps = 0, cal = 0, elev = 0, bestPace = 9999;
    
    filteredRuns.forEach(run => {
      dist += run.distance || 0;
      dur += run.movingTime || 0;
      steps += run.steps || Math.round((run.distance || 0) * 1300); 
      cal += run.calories || Math.round((run.distance || 0) * 65); 
      elev += run.elevation || 0;
      const paceSec = parsePaceToSec(run.avgPace);
      if (paceSec > 0 && paceSec < bestPace) bestPace = paceSec;
    });

    const avgPaceSec = dist > 0 ? (dur / dist) : 0;
    const maxSpeedKmh = bestPace < 9999 && bestPace > 0 ? (3600 / bestPace) : 0;

    setStats({
      distance: dist, duration: dur, steps: steps, calories: cal, elevation: elev,
      avgPaceSec: avgPaceSec, bestPaceSec: bestPace === 9999 ? 0 : bestPace, maxSpeed: maxSpeedKmh, totalActivities: filteredRuns.length
    });

    prepareChartData(filteredRuns, activeTab);
  }, [activeTab, allRuns]);

  const prepareChartData = (runs, tab) => {
    let data = [];
    if (tab === 'Mingguan' || tab === 'Bulanan') {
      const grouped = {};
      runs.forEach(r => {
        const d = new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        grouped[d] = (grouped[d] || 0) + (r.distance || 0);
      });
      data = Object.keys(grouped).map(k => ({ label: k, value: grouped[k] })).slice(-7); 
    } else {
      const grouped = {};
      runs.forEach(r => {
        const m = new Date(r.date).toLocaleDateString('id-ID', { month: 'short' });
        grouped[m] = (grouped[m] || 0) + (r.distance || 0);
      });
      data = Object.keys(grouped).map(k => ({ label: k, value: grouped[k] }));
    }
    setChartData(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold tracking-tight">Statistik Keseluruhan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 px-5 space-y-6">

        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800">
          {['Mingguan', 'Bulanan', 'Tahunan', 'Semua'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab 
                  ? 'bg-[#ccff00] text-slate-950 shadow-[0_0_10px_rgba(204,255,0,0.3)]' 
                  : 'text-slate-400 active:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <Activity size={18} className="text-[#ccff00]"/>
            <h2 className="text-sm font-bold text-white">Ringkasan {activeTab}</h2>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00] mb-1">Total Jarak</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{stats.distance.toFixed(2)} <span className="text-sm font-bold text-slate-500">km</span></h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Aktivitas</p>
              <h3 className="text-xl font-bold text-white">{stats.totalActivities} <span className="text-xs font-bold text-slate-500">Lari</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Calendar size={18} className="text-[#ccff00]"/> Tren Jarak (km)</h3>
          <div className="h-40 w-full min-w-[100px] min-h-[50px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', fontWeight: 'bold', color: '#fff', fontSize: '12px' }} formatter={(value) => [`${Number(value).toFixed(2)} km`, 'Jarak']} />
                  <Bar dataKey="value" fill="#ccff00" radius={[6, 6, 6, 6]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">Tidak ada data untuk periode ini</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4">
          
          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Durasi</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{formatTimeStr(stats.duration)}</h3>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Kalori</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{stats.calories} <span className="text-[10px] font-bold text-slate-500">kcal</span></h3>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Footprints size={16} className="text-emerald-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Langkah</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{stats.steps.toLocaleString('id-ID')}</h3>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-rose-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Elevasi</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{stats.elevation} <span className="text-[10px] font-bold text-slate-500">m</span></h3>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-purple-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pace Rata-rata</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">{formatPaceFromSec(stats.avgPaceSec)} <span className="text-[10px] font-bold text-slate-500">/km</span></h3>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#ccff00]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">Pace Terbaik</p>
            </div>
            <h3 className="text-xl font-black text-[#ccff00] tracking-tight">{formatPaceFromSec(stats.bestPaceSec)} <span className="text-[10px] font-bold text-[#ccff00]/60">/km</span></h3>
          </div>

          <div className="col-span-2 bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700">
                <Gauge size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kecepatan Maks</p>
                <h3 className="text-2xl font-black text-white tracking-tighter">{stats.maxSpeed.toFixed(1)} <span className="text-xs font-bold text-slate-500">km/h</span></h3>
              </div>
            </div>
            <Trophy size={24} className="text-slate-800" />
          </div>

        </div>

      </div>
    </div>
  );
};

export default MobileStats;