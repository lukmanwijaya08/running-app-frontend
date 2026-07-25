import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, MapPin, Clock, Zap, TrendingUp, Activity, Route, Info } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MobileActivityDetail = () => {
  const navigate = useNavigate();

  const activity = { title: 'Morning Run Semarang', date: 'Jumat, 24 Juli 2026 • 06:15 WIB', distance: '5.20 km', movingTime: '32:30', avgPace: '06:15', maxElevation: '45 m' };
  
  // Data split dengan Elevasi
  const splitData = Array.from({ length: 12 }, (_, i) => ({
    km: i + 1,
    pace: `06:${(30 - i) < 10 ? '0' : ''}${Math.max(15, 30 - i)}`,
    paceSec: Math.max(375, 390 - (i * 5)),
    elevation: Math.floor(Math.random() * 15) - 5 // Random elevasi -5 s/d +10
  }));
  
  const chartData = [ { km: '1', pace: 390, elevation: 15 }, { km: '2', pace: 380, elevation: 27 }, { km: '3', pace: 345, elevation: 35 }, { km: '4', pace: 365, elevation: 30 }, { km: '5', pace: 370, elevation: 40 } ];
  const formatPace = (seconds) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`; };
  const fastestPaceSec = Math.min(...splitData.map(s => s.paceSec));

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-sm font-semibold text-slate-800">Detail Aktivitas</h1>
        <button className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full text-purple-600 active:bg-purple-50 transition-colors"><Share2 size={20} /></button>
      </div>

      <div className="max-w-md mx-auto pt-16">
        
        <div className="w-full h-64 bg-slate-200 relative overflow-hidden flex flex-col items-center justify-end pb-6 rounded-b-[2.5rem] shadow-sm">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <svg className="absolute w-full h-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 80 Q 25 30, 50 60 T 90 40" fill="transparent" stroke="#9333ea" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-semibold text-slate-700 z-10 flex items-center gap-1.5">
            <MapPin size={14} className="text-purple-600"/> Peta Rute GPX
          </div>
        </div>

        <div className="px-5 py-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1 tracking-tight">{activity.title}</h2>
          <p className="text-xs font-medium text-slate-400 mb-6">{activity.date}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Route size={12}/> Jarak</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.distance}</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Clock size={12}/> Waktu</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.movingTime}</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Zap size={12}/> Pace Rata-rata</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.avgPace}</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><TrendingUp size={12}/> Elevasi Maks</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.maxElevation}</p>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4">
          
          {/* Split Table (Memanjang ke bawah, tanpa scroll) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-purple-600"/> Split Kilometer
            </h3>
            
            {/* Header dengan tambahan Elv */}
            <div className="flex text-left text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
              <div className="w-8 font-semibold">KM</div>
              <div className="w-12 font-semibold">Pace</div>
              <div className="flex-1"></div>
              <div className="w-10 font-semibold text-right">Elv</div>
            </div>
            
            {/* Isi Tabel */}
            <div className="space-y-1">
              {splitData.map((split, idx) => {
                const isFastest = split.paceSec === fastestPaceSec;
                return (
                  <div key={idx} className="flex items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="w-8 font-medium text-sm text-slate-700">{split.km}</div>
                    <div className={`w-12 font-semibold text-sm ${isFastest ? 'text-purple-600' : 'text-slate-600'}`}>{split.pace}</div>
                    <div className="flex-1 px-2">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isFastest ? 'bg-purple-500' : 'bg-slate-300'}`} style={{ width: `${(fastestPaceSec / split.paceSec) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="w-10 font-medium text-xs text-slate-500 text-right">
                      {split.elevation > 0 ? `+${split.elevation}` : split.elevation}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sisa chart Pace, Elevasi, dan Catatan AI tetap sama seperti sebelumnya... */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-6">Analisis Pace</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="km" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} dy={10} />
                  <YAxis reversed={true} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} tickFormatter={formatPace} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontFamily: 'Poppins', fontWeight: 600 }} formatter={(value) => [formatPace(value), 'Pace']} />
                  <Line type="monotone" dataKey="pace" stroke="#a855f7" strokeWidth={3} dot={{ r: 3, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-orange-400"/> Elevasi</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/><stop offset="95%" stopColor="#fb923c" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="km" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} />
                  <Area type="monotone" dataKey="elevation" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#colorElevation)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-100 rounded-3xl p-5 border border-slate-200 mt-4">
            <div className="flex items-center gap-2 mb-3"><Activity size={16} className="text-slate-700" /><h3 className="font-semibold text-slate-800 text-sm">Catatan Pelatih (AI)</h3></div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">Lari yang sangat konsisten! Anda berhasil mempertahankan pace di bawah 06:15/km di 3 km terakhir. Stamina kardio Anda sangat prima.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MobileActivityDetail;