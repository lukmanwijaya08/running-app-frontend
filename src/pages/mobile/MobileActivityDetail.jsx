import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Share2, MapPin, Clock, Zap, TrendingUp, Activity, Route, Flame, X, Download, ChevronRight, Trophy, Target, Footprints } from 'lucide-react';
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

const parsePaceToSec = (paceStr) => {
  if(!paceStr) return 0;
  const parts = paceStr.split(':').map(Number);
  return (parts[0] * 60) + (parts[1] || 0);
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
  const location = useLocation();
  
  const [activity, setActivity] = useState(null);
  const [splitData, setSplitData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [maxElevation, setMaxElevation] = useState(0);
  const [fastestPace, setFastestPace] = useState(9999);
  
  // STATE BARU: Menyimpan nama kota/lokasi (Default: SEMARANG)
  const [locationName, setLocationName] = useState("SEMARANG");

  const [analytics, setAnalytics] = useState({ cadence: 0, calories: 0, score: 0, analysisText: '', badges: [] });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSticker, setActiveSticker] = useState(0); 
  const stickerRef = useRef(null);

  // FUNGSI BARU: Reverse Geocoding untuk mendapatkan nama Kota
  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      if (data && data.address) {
        // Coba ambil kota, kabupaten, atau state
        const city = data.address.city || data.address.town || data.address.county || data.address.state || "INDONESIA";
        // Filter nama lokasi (contoh: "Kota Semarang" menjadi "SEMARANG")
        const cleanName = city.replace(/Kota |Kabupaten /g, '').toUpperCase();
        setLocationName(cleanName);
      }
    } catch (error) {
      console.error("Gagal mengambil nama lokasi:", error);
    }
  };

  useEffect(() => {
    const savedRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const runData = savedRuns.find(r => r.id === id);

    if (runData) {
      setActivity(runData);
      calculateAnalytics(runData.positions, runData, savedRuns);

      // Trigger fetch lokasi jika ada koordinat rute
      if (runData.positions && runData.positions.length > 0) {
        fetchLocationName(runData.positions[0].lat, runData.positions[0].lon);
      }
    }
  }, [id]);

  const calculateAnalytics = (positions, currentRun, allRuns) => {
    let splits = [];
    let charts = [];
    let runningDist = 0;
    let currentKmTarget = 1;
    let splitStartIndex = 0;
    let highestElev = -9999;
    let bestPace = 9999;

    if (positions && positions.length >= 2) {
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
    }

    setSplitData(splits);
    setChartData(charts);
    setMaxElevation(Math.round(highestElev));
    setFastestPace(bestPace);

    const totalPaceSec = parsePaceToSec(currentRun.avgPace);

    let isLongest = true;
    let isFastest = true;
    let runCount = 0;

    allRuns.forEach(r => {
      if (r.id !== currentRun.id) {
         runCount++;
         if (r.distance >= currentRun.distance) isLongest = false;
         const rPace = parsePaceToSec(r.avgPace);
         if (rPace <= totalPaceSec && rPace > 0) isFastest = false;
      }
    });

    const badges = [];
    if (runCount > 0 && currentRun.distance > 0) {
      if (isLongest) badges.push('Rekor Terjauh');
      if (isFastest) badges.push('Pace Tercepat');
    }

    const calculatedCalories = currentRun.calories || Math.round(currentRun.distance * 65);
    const calculatedCadence = totalPaceSec > 0 ? Math.max(140, Math.min(190, Math.round(180 - ((totalPaceSec - 300) / 6)))) : 0;
    
    const speedKmh = totalPaceSec > 0 ? (3600 / totalPaceSec) : 0;
    const calcScore = Math.min(100, Math.round(40 + (currentRun.distance * 1.5) + (speedKmh * 2.5)));

    let text = "Lari yang sangat konsisten. Terus pertahankan ritme dan rutinitas Anda!";
    if (currentRun.distance > 10) text = "Lari jarak jauh yang luar biasa! Daya tahan dan stamina Anda semakin terbentuk.";
    else if (speedKmh > 10) text = "Pace yang sangat cepat! Sesi lari ini sangat baik untuk melatih kecepatan dan VO2 Max Anda.";
    else if (highestElev > 50) text = "Rute menanjak yang menantang berhasil Anda taklukkan. Kekuatan otot kaki Anda meningkat tajam.";

    setAnalytics({
      cadence: calculatedCadence,
      calories: calculatedCalories,
      score: calcScore || 0,
      analysisText: text,
      badges: badges
    });
  };

  const renderSvgRoute = (positions, styleType = 'normal') => {
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
    const midLat = (minLat + maxLat) / 2;
    const lonMultiplier = Math.cos(midLat * Math.PI / 180);
    const adjLonDiff = lonDiff * lonMultiplier;

    const isThin = styleType === 'thin';
    const isReceipt = styleType === 'receipt';
    
    const strokeW = isThin ? 8 : (isReceipt ? 16 : 32);
    const strokeColor = isThin ? "#ffffff" : (isReceipt ? "#ef4444" : "#ccff00"); 
    const padding = strokeW * 2; 

    let width, height;
    if (adjLonDiff > latDiff) {
       width = 1000;
       height = 1000 * (latDiff / adjLonDiff);
    } else {
       height = 1000;
       width = 1000 * (adjLonDiff / latDiff);
    }

    const points = positions.map(p => {
      const x = ((p.lon - minLon) / lonDiff) * width;
      const y = ((maxLat - p.lat) / latDiff) * height; 
      return `${x + padding},${y + padding}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width + padding * 2} ${height + padding * 2}`} className={isReceipt ? "w-full h-full" : "w-full max-h-[800px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"}>
        <polyline 
          points={points} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth={strokeW} 
          strokeLinecap={isReceipt ? "square" : "round"} 
          strokeLinejoin="round" 
          strokeDasharray={isReceipt ? "15 25" : "none"}
        />
      </svg>
    );
  };

  const handleDownloadSticker = async () => {
    if (stickerRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(stickerRef.current, { 
          cacheBust: true, backgroundColor: 'transparent', pixelRatio: 1, fontEmbedCSS: '', style: { transform: 'scale(1)', transformOrigin: 'top left' } 
        });
        const link = document.createElement('a');
        const styleNames = ['Route', 'Splits', 'Elevation', 'Code', 'Thin', 'Minimal', 'Receipt', 'Strava'];
        link.download = `PlayonApp-${styleNames[activeSticker]}-${activity.id}.png`;
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

  if (!activity) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Data lari tidak ditemukan.</div>;

  const runDate = new Date(activity.date);
  const displayDate = runDate.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const dynamicTitle = activity.title || `${getDynamicTitle(activity.date)} (${runDate.getDate()}/${runDate.getMonth() + 1}/${runDate.getFullYear()})`;
  const mapPositions = activity.positions ? activity.positions.map(p => [p.lat, p.lon]) : [];
  const safeMaxElevation = maxElevation > -9000 ? maxElevation : 0;

  const handleBackNavigation = () => {
    if (location.state?.fromAdd) navigate('/mobile', { replace: true });
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-10 text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={handleBackNavigation} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-sm font-bold text-white">Detail Aktivitas</h1>
        <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full text-[#ccff00] active:bg-slate-800 transition-colors"><Share2 size={20} /></button>
      </div>

      <div className="max-w-md mx-auto pt-16">
        
        {/* PETA 2D */}
        <div className="w-full h-72 bg-slate-100 relative overflow-hidden flex flex-col items-center justify-end pb-6 rounded-b-[2.5rem] shadow-lg z-0 border-b border-slate-800">
          <MapContainer zoomControl={false} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
             {mapPositions.length > 1 && <Polyline positions={mapPositions} color="#ef4444" weight={6} lineCap="round" lineJoin="round" />}
             <FitBounds positions={mapPositions} />
          </MapContainer>
        </div>

        <div className="px-5 py-6">
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{dynamicTitle}</h2>
          <p className="text-xs font-bold text-slate-400 mb-2">{displayDate}</p>
          
          {analytics.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 mt-3">
              {analytics.badges.map(badge => (
                <span key={badge} className="inline-flex items-center gap-1.5 bg-orange-900/30 text-orange-400 border border-orange-800 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  <Trophy size={12} /> {badge}
                </span>
              ))}
            </div>
          )}
          
          {activity.description && (
            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-800 mb-6 font-bold leading-relaxed">{activity.description}</p>
          )}

          {/* METRIK 3x2 (Grid) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Route size={12} className="text-[#ccff00]"/> Jarak</p>
              <p className="text-xl font-black text-white tracking-tight">{activity.distance.toFixed(2)} <span className="text-[10px] font-bold text-slate-500">km</span></p>
            </div>
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Clock size={12} className="text-blue-400"/> Waktu</p>
              <p className="text-xl font-black text-white tracking-tight">{formatTimeStr(activity.movingTime)}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Zap size={12} className="text-[#ccff00]"/> Pace</p>
              <p className="text-xl font-black text-white tracking-tight">{activity.avgPace}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Flame size={12} className="text-orange-500"/> Kalori</p>
              <p className="text-xl font-black text-white tracking-tight">{analytics.calories} <span className="text-[10px] font-bold text-slate-500">cal</span></p>
            </div>
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Footprints size={12} className="text-emerald-400"/> Cadence</p>
              <p className="text-xl font-black text-white tracking-tight">{analytics.cadence} <span className="text-[10px] font-bold text-slate-500">spm</span></p>
            </div>
            <div className="p-4 bg-slate-900 rounded-[1.25rem] shadow-lg border border-slate-800 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-rose-400"/> Elevasi</p>
              <p className="text-xl font-black text-white tracking-tight">{safeMaxElevation} <span className="text-[10px] font-bold text-slate-500">m</span></p>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4 pb-8">
          
          <div className="bg-slate-900 rounded-3xl p-5 shadow-lg border border-slate-800 flex items-center gap-5">
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="5" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#ccff00" strokeWidth="5" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (analytics.score / 100) * 175} strokeLinecap="round" />
              </svg>
              <span className="text-lg font-black text-white">{analytics.score}</span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Target size={12}/> Analisis Performa</h3>
              <p className="text-xs font-bold text-slate-300 leading-relaxed">{analytics.analysisText}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#ccff00]"/> Split Kilometer
            </h3>
            <div className="flex text-left text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">
              <div className="w-8">KM</div>
              <div className="w-12">Pace</div>
              <div className="flex-1"></div>
              <div className="w-12 text-right">Elv</div>
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-2 hide-scrollbar">
              {splitData.map((split, idx) => {
                const isFastest = split.paceSec === fastestPace && splitData.length > 1;
                return (
                  <div key={idx} className="flex items-center py-2 border-b border-slate-800/50 last:border-0">
                    <div className="w-8 font-bold text-sm text-slate-300">{split.km}</div>
                    <div className={`w-12 font-black text-sm ${isFastest ? 'text-[#ccff00]' : 'text-slate-400'}`}>{split.paceStr}</div>
                    <div className="flex-1 px-2">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isFastest ? 'bg-[#ccff00]' : 'bg-slate-600'}`} style={{ width: `${(fastestPace / split.paceSec) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="w-12 font-bold text-xs text-slate-500 text-right">
                      {split.elevationChange > 0 ? `+${split.elevationChange}` : split.elevationChange}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Zap size={16} className="text-[#ccff00]"/> Grafik Pace (per KM)</h3>
            <div className="h-32 w-full min-w-[100px] min-h-[50px]">
              {splitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={splitData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPaceMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="km" hide />
                    <YAxis reversed={true} domain={['dataMin - 15', 'dataMax + 15']} axisLine={false} tickLine={false} tickFormatter={(sec) => {
                       const m = Math.floor(sec/60);
                       const s = Math.floor(sec%60);
                       return `${m}:${s<10?'0'+s:s}`;
                    }} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', fontFamily: 'Poppins' }} />
                    <Area type="monotone" dataKey="paceSec" stroke="#ccff00" strokeWidth={2} fillOpacity={1} fill="url(#colorPaceMain)" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', fontSize: '12px' }} formatter={(value) => [`${Math.floor(value/60)}:${Math.floor(value%60).toString().padStart(2,'0')} /km`, 'Pace']} labelFormatter={(label) => `Split: KM ${label}`} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">Data kurang untuk grafik.</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-orange-500"/> Grafik Ketinggian</h3>
            <div className="h-32 w-full min-w-[100px] min-h-[50px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorElevationMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="km" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', fontFamily: 'Poppins' }} />
                    <Area type="monotone" dataKey="elevation" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorElevationMain)" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', fontSize: '12px' }} formatter={(value) => [`${value}m`, 'Elevasi']} labelFormatter={(label) => `Jarak: ${Number(label).toFixed(2)} km`} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">Data kurang untuk grafik.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL SHARE STICKER */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-5 backdrop-blur-sm">
          
          <div className="w-full max-w-sm flex justify-between items-center mb-6 px-2">
            <p className="text-white/90 text-sm font-bold">Pilih Desain Stiker</p>
            <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between w-full max-w-[420px] mb-8">
            <button onClick={() => setActiveSticker((prev) => (prev > 0 ? prev - 1 : 7))} className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 shrink-0">
              <ChevronLeft size={32} />
            </button>

            {/* Area Sticker Preview */}
            <div className="relative w-64 h-[400px] flex justify-center bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-y-auto overflow-x-hidden hide-scrollbar">
              <div className="origin-top" style={{ transform: 'scale(0.237)', width: '1080px' }}>
                <div ref={stickerRef} className={`w-[1080px] h-fit flex flex-col items-center justify-center ${activeSticker === 6 ? 'p-0' : 'p-12'}`} style={{ background: 'transparent' }}>
                  
                  {/* STYLE 0 */}
                  {activeSticker === 0 && (
                    <div className="flex flex-col items-center w-full gap-8">
                      <div className="w-full flex justify-center items-center my-4">
                         {renderSvgRoute(activity.positions, 'normal')}
                      </div>
                      <div className="w-full flex flex-col items-center justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                        <h1 className="text-[250px] font-black italic leading-none tracking-tighter mb-8 text-[#ccff00]">
                          {activity.distance.toFixed(2)}<span className="text-[80px] ml-4 text-white">KM</span>
                        </h1>
                        <div className="flex w-full justify-center gap-20 items-center px-16 py-10">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold uppercase tracking-widest text-slate-300 mb-2">Waktu</span>
                            <span className="text-7xl font-black">{formatTimeStr(activity.movingTime)}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold uppercase tracking-widest text-slate-300 mb-2">Pace</span>
                            <span className="text-7xl font-black">{activity.avgPace}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STYLE 1 */}
                  {activeSticker === 1 && (
                    <div className="w-full h-fit flex flex-col justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] pb-8 pt-12">
                      <div className="flex items-center gap-6 mb-12">
                        <Activity className="text-[#ccff00]" size={80} />
                        <h3 className="text-7xl font-black uppercase tracking-wider whitespace-nowrap">Split Kilometer</h3>
                      </div>
                      <div className="flex text-left text-slate-300 text-4xl font-bold uppercase tracking-widest border-b-4 border-slate-400 pb-8 mb-10 w-full">
                        <div className="w-32">KM</div>
                        <div className="w-48">Pace</div>
                        <div className="flex-1"></div>
                        <div className="w-32 text-right">Elv</div>
                      </div>
                      <div className="space-y-8 w-full">
                        {splitData.map((split, idx) => {
                          const isFastest = split.paceSec === fastestPace && splitData.length > 1;
                          return (
                            <div key={idx} className="flex items-center py-2">
                              <div className="w-32 font-bold text-6xl text-white">{split.km}</div>
                              <div className={`w-48 font-black text-6xl ${isFastest ? 'text-[#ccff00]' : 'text-white'}`}>{split.paceStr}</div>
                              <div className="flex-1 px-8 relative h-8">
                                <div className="absolute inset-0 bg-white/30 rounded-full"></div>
                                <div className={`absolute inset-y-0 left-0 rounded-full ${isFastest ? 'bg-[#ccff00]' : 'bg-white'}`} style={{ width: `${(fastestPace / split.paceSec) * 100}%` }}></div>
                              </div>
                              <div className="w-32 font-bold text-5xl text-white text-right">
                                {split.elevationChange > 0 ? `+${split.elevationChange}` : split.elevationChange}m
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STYLE 2 */}
                  {activeSticker === 2 && (
                    <div className="w-full h-fit flex flex-col justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] pt-12 pb-8">
                      <div className="flex items-center gap-6 mb-10">
                        <TrendingUp className="text-orange-400" size={80} />
                        <h3 className="text-7xl font-black uppercase tracking-wider whitespace-nowrap">Grafik Elevasi</h3>
                      </div>
                      <div className="flex items-baseline gap-6 mb-16">
                        <span className="text-[140px] font-black text-orange-400">{safeMaxElevation}</span>
                        <span className="text-6xl font-bold text-slate-200">Meter Maksimal</span>
                      </div>
                      <div className="w-full h-[600px] mb-8">
                        {chartData.length > 0 ? (
                          <AreaChart width={950} height={600} data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorElev916" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="elevation" stroke="#f97316" strokeWidth={12} fillOpacity={1} fill="url(#colorElev916)" isAnimationActive={false} />
                          </AreaChart>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl text-slate-300">Data kurang untuk grafik.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STYLE 3 */}
                  {activeSticker === 3 && (
                    <div className="w-full h-fit flex flex-col p-8 font-mono text-[42px] leading-relaxed drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)]">
                      <div className="flex gap-4 mb-16 drop-shadow-md">
                        <div className="w-8 h-8 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#27c93f]"></div>
                      </div>
                      <div className="flex gap-4 font-bold">
                         <span className="text-[#569cd6]">const</span>
                         <span className="text-[#4fc1ff]">runActivity</span>
                         <span className="text-white">=</span>
                         <span className="text-white">{`{`}</span>
                      </div>
                      <div className="pl-16 mt-4 space-y-6 font-bold whitespace-nowrap">
                         <div><span className="text-[#9cdcfe]">title:</span> <span className="text-[#ce9178]">"{dynamicTitle}"</span>,</div>
                         <div><span className="text-[#9cdcfe]">date:</span> <span className="text-[#ce9178]">"{displayDate}"</span>,</div>
                         <div><span className="text-[#9cdcfe]">distance_km:</span> <span className="text-[#b5cea8]">{activity.distance.toFixed(2)}</span>,</div>
                         <div><span className="text-[#9cdcfe]">moving_time:</span> <span className="text-[#ce9178]">"{formatTimeStr(activity.movingTime)}"</span>,</div>
                         <div><span className="text-[#9cdcfe]">avg_pace:</span> <span className="text-[#ce9178]">"{activity.avgPace}"</span>,</div>
                         <div><span className="text-[#9cdcfe]">elevation_m:</span> <span className="text-[#b5cea8]">{safeMaxElevation}</span></div>
                      </div>
                      <div className="mt-4 font-bold text-white">{`};`}</div>
                    </div>
                  )}

                  {/* STYLE 4 */}
                  {activeSticker === 4 && (
                    <div className="w-full h-fit flex flex-col items-center justify-center text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] pb-12">
                      <div className="w-full max-w-[900px] h-[900px] flex items-center justify-center mb-8">
                         {renderSvgRoute(activity.positions, 'thin')}
                      </div>
                      <div className="flex flex-col items-center text-center mt-4 gap-4">
                        <div className="flex items-baseline gap-6 whitespace-nowrap">
                          <span className="text-[200px] font-thin tracking-normal leading-none">{activity.distance.toFixed(2)}</span>
                          <span className="text-[100px] font-thin tracking-widest leading-none">KM</span>
                        </div>
                        <p className="text-5xl font-light text-white/90 tracking-[0.2em] whitespace-nowrap">
                          {formatTimeStr(activity.movingTime)} • {activity.avgPace} /KM
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STYLE 5 */}
                  {activeSticker === 5 && (
                    <div className="w-full h-fit flex flex-col items-center justify-center text-white pb-8 px-4 text-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                      <Flame className="text-[#ccff00] mx-auto mb-12 drop-shadow-lg" size={160} />
                      <h2 className="text-[120px] font-black uppercase tracking-tighter leading-none mb-20 w-full max-w-[1000px] truncate whitespace-nowrap">
                        {dynamicTitle}
                      </h2>
                      <div className="flex justify-between items-center w-full px-6">
                         <div className="flex flex-col items-center">
                            <span className="text-4xl text-[#ccff00] uppercase tracking-widest mb-4">Jarak</span>
                            <span className="text-6xl font-bold whitespace-nowrap">{activity.distance.toFixed(2)} <span className="text-4xl text-slate-200">KM</span></span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-4xl text-[#ccff00] uppercase tracking-widest mb-4">Waktu</span>
                            <span className="text-6xl font-bold whitespace-nowrap">{formatTimeStr(activity.movingTime)}</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-4xl text-[#ccff00] uppercase tracking-widest mb-4">Pace</span>
                            <span className="text-6xl font-bold whitespace-nowrap">{activity.avgPace}</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-4xl text-[#ccff00] uppercase tracking-widest mb-4">Elevasi</span>
                            <span className="text-6xl font-bold whitespace-nowrap">{safeMaxElevation} <span className="text-4xl text-slate-200">m</span></span>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* STYLE 6 - RUN RECEIPT */}
                  {activeSticker === 6 && (
                    <div className="w-[840px] flex flex-col bg-[#fdfbf7] text-slate-800 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] font-mono uppercase">
                      
                      <div className="p-16 flex flex-col">
                        <div className="flex justify-between items-center w-full mb-6">
                          <div className="flex gap-1 text-black">
                            <Activity size={48} strokeWidth={2.5} /> 
                            <Footprints size={48} strokeWidth={2.5} />
                          </div>
                          <div className="font-bold text-3xl tracking-widest normal-case">Run Receipt</div>
                        </div>
                        
                        <div className="w-full border-t-[4px] border-dashed border-slate-300 my-8"></div>
                        
                        <div className="flex justify-between w-full mb-12">
                          <div>
                             <div className="text-5xl font-black tracking-widest mb-3 truncate max-w-[400px]">
                               {activity.title || "INTERVAL"}
                             </div>
                             <div className="text-2xl text-slate-500 font-bold tracking-widest">OUTDOOR RUN</div>
                          </div>
                          <div className="text-right">
                             {/* REVISI: Menggunakan state locationName */}
                             <div className="text-5xl font-black tracking-widest mb-3">{locationName}</div>
                             <div className="text-2xl text-slate-500 font-bold tracking-widest">
                               {new Date(activity.date).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'})}
                             </div>
                          </div>
                        </div>

                        <div className="w-full h-[600px] relative overflow-hidden flex items-center justify-center mb-16 rounded-3xl bg-white">
                          <div className="absolute inset-0 opacity-[0.06] text-[18px] break-all leading-none text-justify overflow-hidden font-mono text-slate-800 flex flex-wrap content-start">
                             {"R N R N R U R U N U N R N R U R N U N R N ".repeat(200)}
                          </div>
                          <div className="absolute top-6 left-6 bg-white px-5 py-2 font-black text-2xl shadow-sm rounded-xl z-20">
                            ASCII MAP
                          </div>
                          <div className="absolute bottom-6 left-6 bg-white p-4 rounded-2xl shadow-sm z-20">
                             <Route size={36} className="text-black" />
                          </div>
                          <div className="absolute bottom-6 right-6 font-black text-2xl bg-white px-4 py-2 shadow-sm leading-none text-center rounded-xl z-20">
                             RUN<br/>RUN
                          </div>
                          
                          <div className="z-10 w-full h-full flex p-16">
                             {renderSvgRoute(activity.positions, 'receipt')}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-y-12 gap-x-8 w-full text-left mb-16 pl-2">
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">DISTANCE</div>
                             <div className="text-4xl font-black">{activity.distance.toFixed(2)} KM</div>
                          </div>
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">AVG PACE</div>
                             <div className="text-4xl font-black">{activity.avgPace}''</div>
                          </div>
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">AVG CADENCE</div>
                             <div className="text-4xl font-black">{analytics.cadence || 0} SPM</div>
                          </div>
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">DURATION</div>
                             <div className="text-4xl font-black">{formatTimeStr(activity.movingTime)}</div>
                          </div>
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">ELEVATION</div>
                             <div className="text-4xl font-black">{safeMaxElevation}m</div>
                          </div>
                          <div>
                             <div className="text-xl text-slate-500 font-bold mb-3 tracking-widest">CALORIES</div>
                             <div className="text-4xl font-black">{analytics.calories} KCAL</div>
                          </div>
                        </div>

                        <div className="w-full border-t-[4px] border-dashed border-slate-300 my-8"></div>
                        
                        <div className="flex flex-col items-center text-center gap-4 mt-4 mb-4">
                          <div className="text-xl font-bold tracking-widest text-black">
                             <div className="mb-2">OFFICE HOUR</div>
                             <div>MON-SUN 09:44</div>
                          </div>
                          <div className="text-3xl font-black mt-8 tracking-widest">
                             ENDURANCE IS YOUR STRENGTH NOW.
                          </div>
                          <div className="text-lg text-slate-400 font-bold mt-6 tracking-widest">
                             GENERATED LOCALLY VIA PLAYON.APP OS.
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-8 overflow-hidden text-[#fdfbf7] rotate-180">
                         <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 10" fill="currentColor">
                            <polygon points="0,0 5,10 10,0 15,10 20,0 25,10 30,0 35,10 40,0 45,10 50,0 55,10 60,0 65,10 70,0 75,10 80,0 85,10 90,0 95,10 100,0 100,0 0,0" />
                         </svg>
                      </div>

                    </div>
                  )}

                  {/* REVISI: STICKER 7 - GAYA STRAVA */}
                  {activeSticker === 7 && (
                    <div className="w-[1080px] h-fit flex flex-col justify-end text-white pt-6 px-16 pb-12 relative">
                      
                      {/* Logo dan Nama Aplikasi di Pojok Kiri Atas Area Teks */}
                      <div className="flex items-center gap-3 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] mb-20 mt-8">
                         <div className="w-14 h-14 bg-[#ccff00] rounded-xl flex items-center justify-center text-slate-900 shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                           <Activity size={50} />
                         </div>
                         <span className="text-6xl font-black tracking-widest uppercase text-white drop-shadow-md">PLAYON.APP</span>
                      </div>

                      <div className="w-full grid grid-cols-3 gap-y-16 gap-x-8 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Jarak</div>
                           <div className="text-7xl font-black">{activity.distance.toFixed(2)} <span className="text-4xl font-bold text-white/90">km</span></div>
                        </div>
                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Pace</div>
                           <div className="text-7xl font-black">{activity.avgPace} <span className="text-4xl font-bold text-white/90">/km</span></div>
                        </div>
                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Waktu</div>
                           <div className="text-7xl font-black">{formatTimeStr(activity.movingTime)}</div>
                        </div>

                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Kalori</div>
                           <div className="text-7xl font-black">{analytics.calories} <span className="text-4xl font-bold text-white/90">kcal</span></div>
                        </div>
                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Cadence</div>
                           <div className="text-7xl font-black">{analytics.cadence || 0} <span className="text-4xl font-bold text-white/90">spm</span></div>
                        </div>
                        <div className="flex flex-col text-left">
                           <div className="text-3xl font-bold uppercase tracking-widest text-white/80 mb-2">Elevasi</div>
                           <div className="text-7xl font-black">{safeMaxElevation} <span className="text-4xl font-bold text-white/90">m</span></div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>

            <button onClick={() => setActiveSticker((prev) => (prev < 7 ? prev + 1 : 0))} className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 shrink-0">
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[0,1,2,3,4,5,6,7].map(idx => (
              <div key={idx} className={`w-2 h-2 rounded-full ${activeSticker === idx ? 'bg-[#ccff00] w-6' : 'bg-slate-700'} transition-all`}></div>
            ))}
          </div>

          <button 
            onClick={handleDownloadSticker} 
            disabled={isDownloading}
            className={`w-full max-w-xs bg-[#ccff00] text-slate-950 font-bold text-lg py-4 rounded-full flex items-center justify-center gap-3 transition-transform ${isDownloading ? 'opacity-70' : 'active:scale-95 shadow-[0_0_15px_rgba(204,255,0,0.4)]'}`}
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