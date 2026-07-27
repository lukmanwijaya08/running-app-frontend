import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Share2, MapPin, Clock, Zap, TrendingUp, Activity, Route, Flame, X, Download, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
};

const formatTimeStr = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const formatPaceFromSec = (secondsPerKm) => {
  if(!isFinite(secondsPerKm) || secondsPerKm === 0) return "00:00";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [positions, map]);
  return null;
};

const MobileActivityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [activity, setActivity] = useState(null);
  const [splitData, setSplitData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [maxElevation, setMaxElevation] = useState(0);
  const [fastestPace, setFastestPace] = useState(9999);
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSticker, setActiveSticker] = useState(0); 
  const stickerRef = useRef(null);

  useEffect(() => {
    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const runData = savedRuns.find(r => r.id === id);

    if (runData) {
      setActivity(runData);
      calculateAnalytics(runData.positions);
    }
  }, [id]);

  const calculateAnalytics = (positions) => {
    if (!positions || positions.length < 2) return;

    let splits = [];
    let charts = [];
    let runningDist = 0;
    let currentKmTarget = 1;
    let splitStartIndex = 0;
    let highestElev = -9999;
    let bestPace = 9999;

    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i-1];
      const curr = positions[i];
      
      const d = getDistance(prev.lat, prev.lon, curr.lat, curr.lon);
      runningDist += d;

      if(curr.alt > highestElev) highestElev = curr.alt;

      if (charts.length === 0 || runningDist - charts[charts.length-1].km >= 0.05) {
        charts.push({ km: runningDist, elevation: Math.round(curr.alt) });
      }

      if (runningDist >= currentKmTarget || i === positions.length - 1) {
        const splitStartPos = positions[splitStartIndex];
        const splitEndPos = positions[i];
        const durationMs = splitEndPos.time - splitStartPos.time;
        const durationSec = durationMs / 1000;
        
        let actualSplitDist = 0;
        for(let j = splitStartIndex + 1; j <= i; j++) {
            actualSplitDist += getDistance(positions[j-1].lat, positions[j-1].lon, positions[j].lat, positions[j].lon);
        }

        const paceSecPerKm = actualSplitDist > 0 ? durationSec / actualSplitDist : 0;
        if(paceSecPerKm > 0 && paceSecPerKm < bestPace) bestPace = paceSecPerKm;
        const elevChange = Math.round((splitEndPos.alt || 0) - (splitStartPos.alt || 0));

        splits.push({ km: currentKmTarget, paceSec: paceSecPerKm, paceStr: formatPaceFromSec(paceSecPerKm), elevationChange: elevChange });
        currentKmTarget++;
        splitStartIndex = i;
      }
    }
    setSplitData(splits);
    setChartData(charts);
    setMaxElevation(Math.round(highestElev));
    setFastestPace(bestPace);
  };

  const renderSvgRoute = (positions) => {
    if (!positions || positions.length < 2) return null;
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    positions.forEach(p => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lon < minLon) minLon = p.lon;
      if (p.lon > maxLon) maxLon = p.lon;
    });

    const latDiff = maxLat - minLat || 0.0001;
    const lonDiff = maxLon - minLon || 0.0001;
    const width = 400;
    const height = 400; 
    
    const points = positions.map(p => {
      const x = ((p.lon - minLon) / lonDiff) * (width * 0.8) + (width * 0.1);
      const y = ((maxLat - p.lat) / latDiff) * (height * 0.8) + (height * 0.1);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-[0_10px_15px_rgba(147,51,234,0.4)]">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="url(#routeGrad)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const handleDownloadSticker = async () => {
    if (stickerRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(stickerRef.current, { 
          cacheBust: true, 
          backgroundColor: 'transparent',
          pixelRatio: 3, 
          skipAutoScale: true
        });
        const link = document.createElement('a');
        link.download = `RunApp-${activeSticker === 0 ? 'Route' : activeSticker === 1 ? 'Splits' : 'Elevation'}-${activity.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Gagal membuat stiker", err);
        alert("Terjadi kesalahan saat memproses gambar.");
      } finally {
        setIsDownloading(false);
        setIsShareModalOpen(false);
      }
    }
  };

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Data lari tidak ditemukan.</div>;
  }

  const runDate = new Date(activity.date);
  const displayDate = runDate.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const dynamicTitle = `${getDynamicTitle(activity.date)} (${runDate.getDate()}/${runDate.getMonth() + 1}/${runDate.getFullYear()})`;
  const mapPositions = activity.positions.map(p => [p.lat, p.lon]);
  const safeMaxElevation = maxElevation > -9000 ? maxElevation : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      
      {/* HEADER HALAMAN */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-sm font-semibold text-slate-800">Detail Aktivitas</h1>
        <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full text-purple-600 active:bg-purple-50 transition-colors"><Share2 size={20} /></button>
      </div>

      <div className="max-w-md mx-auto pt-16">
        
        {/* PETA UTAMA LEAFLET */}
        <div className="w-full h-72 bg-slate-200 relative overflow-hidden flex flex-col items-center justify-end pb-6 rounded-b-[2.5rem] shadow-sm z-0">
          <MapContainer zoomControl={false} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
             {mapPositions.length > 1 && <Polyline positions={mapPositions} color="#9333ea" weight={5} lineCap="round" lineJoin="round" />}
             <FitBounds positions={mapPositions} />
          </MapContainer>
        </div>

        <div className="px-5 py-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1 tracking-tight">{dynamicTitle}</h2>
          <p className="text-xs font-medium text-slate-400 mb-6">{displayDate}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Route size={12}/> Jarak</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.distance.toFixed(2)} km</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Clock size={12}/> Waktu Bergerak</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{formatTimeStr(activity.movingTime)}</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Zap size={12}/> Pace Rata-rata</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.avgPace}</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><TrendingUp size={12}/> Elevasi Maks</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{safeMaxElevation} m</p>
            </div>
          </div>
        </div>

        {/* --- BAGIAN YANG SEMPAT HILANG (SPLIT & GRAFIK DI UI UTAMA) --- */}
        <div className="px-5 space-y-4 pb-8">
          
          {/* TABEL SPLIT (UI UTAMA) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-purple-600"/> Split Kilometer
            </h3>
            
            <div className="flex text-left text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">
              <div className="w-8 font-semibold">KM</div>
              <div className="w-12 font-semibold">Pace</div>
              <div className="flex-1"></div>
              <div className="w-12 font-semibold text-right">Elv</div>
            </div>
            
            <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
              {splitData.map((split, idx) => {
                const isFastest = split.paceSec === fastestPace && splitData.length > 1;
                return (
                  <div key={idx} className="flex items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="w-8 font-medium text-sm text-slate-700">{split.km}</div>
                    <div className={`w-12 font-semibold text-sm ${isFastest ? 'text-purple-600' : 'text-slate-600'}`}>{split.paceStr}</div>
                    <div className="flex-1 px-2">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isFastest ? 'bg-purple-500' : 'bg-slate-300'}`} style={{ width: `${(fastestPace / split.paceSec) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="w-12 font-medium text-xs text-slate-500 text-right">
                      {split.elevationChange > 0 ? `+${split.elevationChange}` : split.elevationChange}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRAFIK ELEVASI (UI UTAMA) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-orange-400"/> Grafik Ketinggian</h3>
            <div className="h-32 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorElevationMain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb923c" stopOpacity={0.4}/><stop offset="95%" stopColor="#fb923c" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="km" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} />
                    <Area type="monotone" dataKey="elevation" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#colorElevationMain)" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} formatter={(value) => [`${value}m`, 'Elevasi']} labelFormatter={(label) => `Jarak: ${Number(label).toFixed(2)} km`} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Data kurang untuk grafik.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL SHARE OVERLAY (STAT STICKER) --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-5">
          
          <div className="w-full max-w-sm flex justify-between items-center mb-6 px-2">
            <p className="text-white/90 text-sm font-semibold">Pilih Desain Stiker</p>
            <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between w-full max-w-[420px] mb-8">
            <button onClick={() => setActiveSticker((prev) => (prev > 0 ? prev - 1 : 2))} className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 shrink-0">
              <ChevronLeft size={32} />
            </button>

            {/* PREVIEW CONTAINER STIKER */}
            <div className="relative w-64 h-64 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMCIvPgogIDxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] flex justify-center rounded-[2rem] border-2 border-white/10 shadow-2xl overflow-hidden items-start">
              <div 
                ref={stickerRef} 
                className="w-[1080px] min-h-[1080px] h-fit flex flex-col items-center justify-center p-12 transform scale-[0.237] origin-top" 
                style={{ background: 'transparent' }}
              >
                
                {/* --- STIKER 1: RUTE & DATA UTAMA --- */}
                {activeSticker === 0 && (
                  <>
                    <div className="w-full max-w-[650px] aspect-square flex items-center justify-center mb-8">
                       {renderSvgRoute(activity.positions)}
                    </div>
                    <div className="w-full flex flex-col items-center justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] mt-4">
                      <div className="flex items-center gap-3 mb-6 bg-white/10 px-8 py-3 rounded-full backdrop-blur-sm border border-white/20">
                        <Flame className="text-orange-400" size={32} fill="currentColor" />
                        <h3 className="text-3xl font-bold tracking-widest uppercase">RunApp</h3>
                      </div>
                      <h1 className="text-[200px] font-black italic leading-none tracking-tighter mb-10">
                        {activity.distance.toFixed(2)}<span className="text-[70px] ml-4 text-white/80">KM</span>
                      </h1>
                      <div className="flex w-full justify-center gap-16 items-center px-12 mt-4">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-bold uppercase tracking-widest text-purple-300 mb-2">Waktu</span>
                          <span className="text-6xl font-black">{formatTimeStr(activity.movingTime)}</span>
                        </div>
                        <div className="w-1.5 h-20 bg-white/30 rounded-full"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-bold uppercase tracking-widest text-purple-300 mb-2">Pace</span>
                          <span className="text-6xl font-black">{activity.avgPace}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* --- STIKER 2: TABEL SPLIT (MENAMPILKAN SEMUA DATA) --- */}
                {activeSticker === 1 && (
                  <div className="w-full h-full flex flex-col justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] p-8">
                    <div className="flex items-center gap-4 mb-16">
                      <Activity className="text-purple-400" size={64} />
                      <h3 className="text-6xl font-black uppercase tracking-wider">Split Kilometer</h3>
                    </div>
                    
                    <div className="flex text-left text-white/60 text-3xl font-bold uppercase tracking-widest border-b-4 border-white/20 pb-6 mb-8">
                      <div className="w-32">KM</div>
                      <div className="w-48">Pace</div>
                      <div className="flex-1"></div>
                      <div className="w-32 text-right">Elv</div>
                    </div>
                    
                    <div className="space-y-6 w-full pb-10">
                      {splitData.map((split, idx) => {
                        const isFastest = split.paceSec === fastestPace && splitData.length > 1;
                        return (
                          <div key={idx} className="flex items-center py-4">
                            <div className="w-32 font-bold text-5xl">{split.km}</div>
                            <div className={`w-48 font-black text-5xl ${isFastest ? 'text-purple-400' : 'text-white'}`}>{split.paceStr}</div>
                            <div className="flex-1 px-8 relative h-6">
                              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                              <div 
                                className={`absolute inset-y-0 left-0 rounded-full ${isFastest ? 'bg-purple-500' : 'bg-white'}`} 
                                style={{ width: `${(fastestPace / split.paceSec) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-32 font-bold text-4xl text-white/80 text-right">
                              {split.elevationChange > 0 ? `+${split.elevationChange}` : split.elevationChange}m
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- STIKER 3: GRAFIK ELEVASI --- */}
                {activeSticker === 2 && (
                  <div className="w-full h-full flex flex-col justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] p-8">
                    <div className="flex items-center gap-4 mb-12">
                      <TrendingUp className="text-orange-400" size={64} />
                      <h3 className="text-6xl font-black uppercase tracking-wider">Grafik Elevasi</h3>
                    </div>
                    <div className="flex items-baseline gap-4 mb-16">
                      <span className="text-[120px] font-black">{safeMaxElevation}</span>
                      <span className="text-5xl font-bold text-white/70">Meter Maksimal</span>
                    </div>
                    <div className="w-full h-[500px]">
                      {chartData.length > 0 ? (
                        <AreaChart width={900} height={500} data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="elevation" stroke="#fb923c" strokeWidth={8} fillOpacity={1} fill="url(#colorElev)" isAnimationActive={false} />
                        </AreaChart>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-white/50">Data kurang untuk grafik.</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            <button onClick={() => setActiveSticker((prev) => (prev < 2 ? prev + 1 : 0))} className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 shrink-0">
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full ${activeSticker === 0 ? 'bg-purple-500 w-6' : 'bg-white/30'} transition-all`}></div>
            <div className={`w-2 h-2 rounded-full ${activeSticker === 1 ? 'bg-purple-500 w-6' : 'bg-white/30'} transition-all`}></div>
            <div className={`w-2 h-2 rounded-full ${activeSticker === 2 ? 'bg-purple-500 w-6' : 'bg-white/30'} transition-all`}></div>
          </div>

          <button 
            onClick={handleDownloadSticker} 
            disabled={isDownloading}
            className={`w-full max-w-xs bg-purple-600 text-white font-bold text-lg py-4 rounded-full flex items-center justify-center gap-3 transition-transform ${isDownloading ? 'opacity-70' : 'active:scale-95 shadow-[0_10px_30px_rgba(147,51,234,0.4)]'}`}
          >
            {isDownloading ? (
              <span className="animate-pulse">Menyiapkan...</span>
            ) : (
              <><Download size={24} /> Simpan Gambar PNG</>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default MobileActivityDetail;