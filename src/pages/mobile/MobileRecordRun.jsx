import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Play, Square, Pause, MapPin, Activity, Clock, Route as RouteIcon, AlertCircle } from 'lucide-react';

const blueDotIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const RecenterAutomatically = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
};

const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

const MobileRecordRun = () => {
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  
  const [distance, setDistance] = useState(0); 
  const [duration, setDuration] = useState(0); 
  const [currentPace, setCurrentPace] = useState(0); // Detik per km (Real-time)
  const [errorMessage, setErrorMessage] = useState('');
  
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const wakeLockRef = useRef(null); // Ref untuk Wake Lock API

  // Fungsi untuk meminta Screen Wake Lock (Layar Anti Mati)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current !== null) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Pantau visibilitas dokumen untuk me-request ulang Wake Lock jika tab aktif kembali
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRecording && !isPaused) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Error getting initial location:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Efek untuk menghitung Current Pace (Kecepatan Real-time saat ini)
  useEffect(() => {
    if (positions.length >= 2 && !isPaused) {
      const last = positions[positions.length - 1];
      const prev = positions[positions.length - 2];
      
      const dist = calculateDistance(prev.lat, prev.lon, last.lat, last.lon);
      const timeSec = (last.time - prev.time) / 1000;

      if (timeSec > 0) {
        const speedKmH = (dist / timeSec) * 3600;
        
        // Jika kecepatan kurang dari 1.5 km/jam, anggap sedang berhenti / diam
        if (speedKmH < 1.5) {
          setCurrentPace(0);
        } else {
          setCurrentPace(timeSec / dist);
        }
      }
    }
  }, [positions, isPaused]);

  const startRecording = () => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Browser/Perangkat Anda tidak mendukung GPS.");
      return;
    }

    setIsRecording(true);
    setIsPaused(false);
    setErrorMessage('');
    
    // Minta layar tetap menyala
    requestWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;
        const timestamp = position.timestamp; 
        
        const newPos = { lat: latitude, lon: longitude, alt: altitude || 0, time: timestamp };
        
        setCurrentPosition([latitude, longitude]);
        setPositions((prevPositions) => {
          if (prevPositions.length > 0) {
            const lastPos = prevPositions[prevPositions.length - 1];
            const distAdded = calculateDistance(lastPos.lat, lastPos.lon, newPos.lat, newPos.lon);
            setDistance((prevDist) => prevDist + distAdded);
          }
          return [...prevPositions, newPos];
        });
      },
      (error) => {
        console.error("GPS Error:", error);
        if(error.code === 1) setErrorMessage("Akses lokasi ditolak iOS/Browser.");
        else if(error.code === 2) setErrorMessage("Sinyal GPS tidak tersedia.");
        else if(error.code === 3) setErrorMessage("Pencarian GPS Timeout (lambat).");
        
        setTimeout(() => setErrorMessage(''), 5000); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const pauseRecording = () => {
    setIsPaused(true);
    setCurrentPace(0); // Set pace ke 0 saat dijeda
    releaseWakeLock(); // Izinkan layar mati
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
  };

  const resumeRecording = () => startRecording();

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    releaseWakeLock();
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    clearInterval(timerRef.current);
    
    if (distance < 0.01 && duration < 10) {
      alert("Jarak atau waktu terlalu pendek untuk disimpan.");
      navigate('/mobile');
      return;
    }

    if(window.confirm('Akhiri sesi lari ini dan simpan?')) {
      const runId = Date.now().toString(); 
      const now = new Date();
      
      const totalCalories = Math.round(distance * 65);
      const totalSteps = Math.round(distance * 1300);

      const newRunData = {
        id: runId,
        title: `${getDynamicTitle(now.toISOString())} (${now.toLocaleDateString('id-ID')})`,
        date: now.toISOString(),
        distance: distance,
        movingTime: duration,
        avgPace: formatAvgPace(), // Simpan Average Pace untuk riwayat keseluruhan
        calories: totalCalories,
        steps: totalSteps,
        positions: positions 
      };

      const existingRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
      localStorage.setItem('savedRuns', JSON.stringify([newRunData, ...existingRuns]));
      
      navigate(`/mobile/activity/${runId}`);
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
    return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  };

  // Fungsi memformat Pace Rata-rata (Untuk Data yang Disimpan)
  const formatAvgPace = () => {
    if (distance === 0 || duration === 0) return "00:00";
    const minutesPerKm = (duration / 60) / distance;
    const m = Math.floor(minutesPerKm);
    const s = Math.floor((minutesPerKm - m) * 60);
    return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  };

  // Fungsi memformat Pace Real-Time (Untuk Display UI)
  const formatCurrentPaceUI = () => {
    if (!currentPace || currentPace === 0 || !isFinite(currentPace)) return "00:00";
    const m = Math.floor(currentPace / 60);
    const s = Math.floor(currentPace % 60);
    return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  };

  const polylinePositions = positions.map(p => [p.lat, p.lon]);

  return (
    <div className="h-screen flex flex-col bg-slate-900 relative">
      
      {errorMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="absolute top-0 w-full z-50 px-5 pt-8 pb-4 flex items-center justify-between bg-gradient-to-b from-slate-900/80 to-transparent">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white active:scale-95">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
          <MapPin size={14} className="text-purple-400" />
          <span className="text-xs font-semibold text-white">GPS {currentPosition ? 'Aktif' : 'Mencari...'}</span>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-800 relative z-0">
        {currentPosition ? (
          <MapContainer center={currentPosition} zoom={17} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polylinePositions.length > 1 && <Polyline positions={polylinePositions} color="#9333ea" weight={5} lineCap="round" lineJoin="round" />}
            <Marker position={currentPosition} icon={blueDotIcon} />
            {(isRecording && !isPaused) && <RecenterAutomatically position={currentPosition} />}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Activity className="animate-pulse mb-3 text-purple-500" size={32} />
            <p className="text-sm font-medium">Mencari sinyal GPS...</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 pt-8 pb-10 px-6 -mt-6">
        <div className="grid grid-cols-3 gap-4 text-center mb-8">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><RouteIcon size={12}/> Jarak</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{distance.toFixed(2)}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">km</p>
          </div>
          <div className="border-x border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Clock size={12}/> Waktu</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{formatTime(duration)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Activity size={12}/> Pace</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{formatCurrentPaceUI()}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">/km</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6">
          {!isRecording ? (
             <button onClick={startRecording} disabled={!currentPosition} className={`w-full py-4 rounded-full font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${currentPosition ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-slate-200 text-slate-400'}`}>
                <Play size={24} className={currentPosition ? "fill-white" : ""} /> Mulai Lari
             </button>
          ) : (
            <>
              {isPaused ? (
                <button onClick={resumeRecording} className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 active:scale-95 transition-transform"><Play size={32} className="fill-white" /></button>
              ) : (
                <button onClick={pauseRecording} className="w-20 h-20 bg-orange-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-200 active:scale-95 transition-transform"><Pause size={32} className="fill-white" /></button>
              )}
              <button onClick={stopRecording} className="w-20 h-20 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-300 active:scale-95 transition-transform"><Square size={28} className="fill-white" /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileRecordRun;