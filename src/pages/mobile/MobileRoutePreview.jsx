// File 2: MobileRoutePreview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

const MobileRoutePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Menerima data asli dari navigasi halaman Activity Detail
  const runData = location.state || { 
    distance: 5.4, 
    elevation: 124, 
    avgPace: "05:40", 
    title: "Berlari Sore" 
  };

  // --- DATA TARGET (Dari Rute Asli) ---
  const targetDistance = runData.distance;
  const targetElevation = runData.elevation;
  
  const parsePaceToSec = (paceStr) => {
    if(!paceStr) return 340;
    const parts = paceStr.split(':').map(Number);
    return (parts[0] * 60) + (parts[1] || 0);
  };
  const basePaceSec = parsePaceToSec(runData.avgPace);

  // --- STATE ANIMASI ---
  const [progress, setProgress] = useState(0); // 0.0 hingga 1.0

  // --- REFERENSI ANIMASI ---
  const requestRef = useRef();
  const startTimeRef = useRef(null);
  const ANIMATION_DURATION = 10000; 

  // --- FUNGSI ANIMASI UTAMA ---
  const animate = (time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    const currentProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
    setProgress(currentProgress);

    if (currentProgress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // --- PERHITUNGAN REAL-TIME BERDASARKAN PROGRESS ---
  const currentDistance = (targetDistance * progress).toFixed(2).replace('.', ',');
  const currentElevation = Math.round(targetElevation * progress);
  
  const simulatedPaceSec = progress === 0 ? 0 : basePaceSec + (Math.sin(progress * 15) * 15);
  const paceM = Math.floor(simulatedPaceSec / 60);
  const paceS = Math.floor(simulatedPaceSec % 60);
  const currentPace = progress === 0 ? "00:00" : `${paceM}:${paceS < 10 ? '0'+paceS : paceS}`;

  return (
    <div className="relative min-h-screen bg-[#4a80ba] overflow-hidden flex flex-col font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 1. SIMULASI BACKGROUND PETA 3D (Bergerak Otomatis) */}
      <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
        <div className="h-[45%] w-full bg-gradient-to-b from-[#3a6ca3] via-[#6a97c5] to-[#9cbce0]"></div>
        
        <div className="h-[55%] w-full relative" style={{ perspective: '1000px' }}>
           <div className="absolute inset-0 bg-[#3d4c35]" style={{
               backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')`,
               backgroundSize: 'cover',
               backgroundRepeat: 'repeat-y',
               backgroundPosition: `center ${progress * 100}%`, 
               transformOrigin: 'top center',
               transform: 'rotateX(70deg) scale(2.5) translateY(-10%)',
               boxShadow: 'inset 0 20px 30px rgba(156,188,224,1)' 
           }}>
             <div className="absolute top-[30%] left-[20%] text-[8px] text-white/70 font-semibold tracking-wide drop-shadow-md transform -rotateX(0deg) scale-y-150">Surakarta</div>
             <div className="absolute top-[50%] left-[45%] text-[10px] text-white/80 font-semibold tracking-wide drop-shadow-md transform -rotateX(0deg) scale-y-150">Sumberejo</div>
             <div className="absolute top-[80%] right-[10%] text-xs text-white font-bold tracking-wide drop-shadow-md transform -rotateX(0deg) scale-y-150">Bandung</div>
           </div>
        </div>
      </div>

      {/* 2. UI OVERLAY BERSIH */}
      <div className="relative z-10 w-full h-full flex flex-col pt-12 px-5">
        
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-black/80 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            RUNAPP
          </h1>
          <p className="text-sm font-semibold text-white/90 mt-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            {runData.title}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mt-2 px-2">
          
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Pace</span>
            <span className="text-4xl font-bold text-white tracking-tight leading-none tabular-nums" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.4)' }}>{currentPace}</span>
            <span className="text-[11px] font-semibold text-white/90 mt-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>/km</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Elevasi</span>
            <span className="text-4xl font-bold text-white tracking-tight leading-none tabular-nums" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.4)' }}>{currentElevation}</span>
            <span className="text-[11px] font-semibold text-white/90 mt-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>m</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-white/90 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Jarak</span>
            <span className="text-4xl font-bold text-white tracking-tight leading-none tabular-nums" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.4)' }}>{currentDistance}</span>
            <span className="text-[11px] font-semibold text-white/90 mt-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>km</span>
          </div>

        </div>
      </div>

      {/* 3. MAP MARKER STATIS DI TENGAH */}
      <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
         <div className="absolute w-4 h-4 rounded-full bg-[#82D136] border-2 border-[#5a9c1e] transform translate-x-2 translate-y-1"></div>
         <div className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5722]"></div>
         </div>
      </div>

    </div>
  );
};

export default MobileRoutePreview;