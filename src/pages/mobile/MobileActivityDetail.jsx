import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Share2, MapPin, Clock, Zap, TrendingUp, Activity, Route, Flame, Footprints } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

// FitBounds Component untuk otomatis fokus ke rute lari
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

        splits.push({
          km: currentKmTarget,
          paceSec: paceSecPerKm,
          paceStr: formatPaceFromSec(paceSecPerKm),
          elevationChange: elevChange
        });

        currentKmTarget++;
        splitStartIndex = i;
      }
    }

    setSplitData(splits);
    setChartData(charts);
    setMaxElevation(Math.round(highestElev));
    setFastestPace(bestPace);
  };

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Data lari tidak ditemukan.</div>;
  }

  const runDate = new Date(activity.date);
  const displayDate = runDate.toLocaleString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const dynamicTitle = `${getDynamicTitle(activity.date)} (${runDate.getDate()}/${runDate.getMonth() + 1}/${runDate.getFullYear()})`;
  const mapPositions = activity.positions.map(p => [p.lat, p.lon]);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-sm font-semibold text-slate-800">Detail Aktivitas</h1>
        <button className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full text-purple-600 active:bg-purple-50 transition-colors"><Share2 size={20} /></button>
      </div>

      <div className="max-w-md mx-auto pt-16">
        
        {/* LEAFLET MAP TERINTEGRASI */}
        <div className="w-full h-72 bg-slate-200 relative overflow-hidden flex flex-col items-center justify-end pb-6 rounded-b-[2.5rem] shadow-sm z-0">
          <MapContainer zoomControl={false} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
             {mapPositions.length > 1 && <Polyline positions={mapPositions} color="#9333ea" weight={5} lineCap="round" lineJoin="round" />}
             <FitBounds positions={mapPositions} />
          </MapContainer>
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-semibold text-slate-700 z-[400] flex items-center gap-1.5 pointer-events-none mb-2">
            <MapPin size={14} className="text-purple-600"/> Peta Rute Terekam
          </div>
        </div>

        <div className="px-5 py-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1 tracking-tight">{dynamicTitle}</h2>
          <p className="text-xs font-medium text-slate-400 mb-6">{displayDate}</p>

          <div className="grid grid-cols-2 gap-3">
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
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{maxElevation > -9000 ? maxElevation : 0} m</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Flame size={12}/> Kalori</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.calories || 0} kkal</p>
            </div>
            <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-50">
              <p className="text-[10px] font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Footprints size={12}/> Langkah</p>
              <p className="text-xl font-semibold text-slate-800 tracking-tight">{activity.steps || 0}</p>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-4">
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

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={16} className="text-orange-400"/> Grafik Ketinggian</h3>
            <div className="h-32 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fb923c" stopOpacity={0.4}/><stop offset="95%" stopColor="#fb923c" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="km" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} />
                    <Area type="monotone" dataKey="elevation" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#colorElevation)" />
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
    </div>
  );
};

export default MobileActivityDetail;