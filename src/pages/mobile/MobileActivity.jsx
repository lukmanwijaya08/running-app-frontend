import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Flame, Activity } from 'lucide-react';

// Helper untuk judul dinamis (konsisten dengan halaman detail)
const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

// Formatting Time helper (dari detik ke HH:MM:SS atau MM:SS)
const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const MobileActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Mengambil data dari localStorage saat halaman dimuat
    const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    // Urutkan dari yang paling baru
    const sortedData = savedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sortedData);
  }, []);

  return (
    <div className="pt-8 px-5 pb-6">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shadow-sm">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Semua Aktivitas</h1>
          <p className="text-xs font-medium text-slate-400">Riwayat lari yang tersimpan</p>
        </div>
      </div>

      {/* Daftar Aktivitas */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          // Tampilan jika belum ada data lari di Local Storage
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-50 shadow-sm">
            <Map size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-600">Belum ada aktivitas lari</p>
            <p className="text-xs mt-1">Mulai rekam lari pertamamu sekarang!</p>
          </div>
        ) : (
          // Mapping data aktivitas
          activities.map((run) => {
            const runDate = new Date(run.date);
            const dateString = runDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const dynamicTitle = getDynamicTitle(run.date);
            
            return (
              <div 
                key={run.id} 
                onClick={() => navigate(`/mobile/activity/${run.id}`)} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                {/* Judul & Tanggal */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                      <Map size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{dynamicTitle}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{dateString}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>

                {/* Ringkasan Split Card (Jarak, Pace, Waktu) */}
                <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-1.5">
                    <Route size={14} className="text-slate-400"/>
                    <p className="text-xs font-semibold text-slate-700">{(run.distance || 0).toFixed(2)} km</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-slate-400"/>
                    <p className="text-xs font-semibold text-slate-700">{run.avgPace || "00:00"}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400"/>
                    <p className="text-xs font-semibold text-slate-700">{formatTimeStr(run.movingTime)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileActivity;