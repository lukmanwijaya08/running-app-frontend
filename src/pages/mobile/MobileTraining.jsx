import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, CalendarDays, CheckCircle2, Play, Activity, Zap, ShieldPlus, Map, Trophy, ListTodo, Flame } from 'lucide-react';

// --- DATA PROGRAM LATIHAN ---
const PROGRAM_DB = {
  '5k': { id: '5k', name: 'Program 5K', duration: '8 Minggu', type: 'Beginner', targetGoal: 'speed', icon: Zap },
  '10k': { id: '10k', name: 'Program 10K', duration: '10 Minggu', type: 'Intermediate', targetGoal: 'distance', icon: Activity },
  'hm': { id: 'hm', name: 'Half Marathon', duration: '12 Minggu', type: 'Advanced', targetGoal: 'distance', icon: Map },
  'marathon': { id: 'marathon', name: 'Marathon', duration: '16 Minggu', type: 'Expert', targetGoal: 'distance', icon: Trophy },
  'fatloss': { id: 'fatloss', name: 'Fat Loss Run', duration: '8 Minggu', type: 'All Levels', targetGoal: 'weight_loss', icon: Flame } 
};

// --- DATA JADWAL (Dummy Dinamis) ---
const SCHEDULE_TEMPLATES = {
  run: { title: 'Lari Ketahanan', desc: 'Lari santai dengan pace konsisten.', distance: '5.0', type: 'run' },
  speed: { title: 'Interval Speed', desc: 'Lari cepat 1 menit, jalan 1 menit. Ulangi 5x.', distance: '3.0', type: 'run' },
  recovery: { title: 'Recovery Day', desc: 'Istirahat total atau peregangan ringan.', distance: '0', type: 'rest' },
  long: { title: 'Long Run', desc: 'Lari jarak jauh di akhir pekan.', distance: '8.0', type: 'run' }
};

const generateWeeklySchedule = (programId) => {
  const patterns = {
    '5k': ['run', 'recovery', 'speed', 'recovery', 'run', 'recovery', 'long'],
    '10k': ['run', 'speed', 'recovery', 'run', 'recovery', 'run', 'long'],
    'hm': ['run', 'speed', 'run', 'recovery', 'run', 'recovery', 'long'],
    'marathon': ['run', 'run', 'speed', 'recovery', 'long', 'recovery', 'long'],
    'fatloss': ['run', 'recovery', 'speed', 'run', 'recovery', 'run', 'recovery'],
  };
  const pattern = patterns[programId] || patterns['5k'];
  return pattern.map(key => SCHEDULE_TEMPLATES[key]);
};

const MobileTraining = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [profileGoal, setProfileGoal] = useState('speed');
  const [activeProgramId, setActiveProgramId] = useState('5k');
  const [progressData, setProgressData] = useState({ completedDays: 12, totalDays: 56, completedToday: false });
  
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; 
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  // --- EFFECTS ---
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    let userGoal = 'speed';
    if (savedProfile && savedProfile.mainTarget) {
      userGoal = savedProfile.mainTarget;
      setProfileGoal(userGoal);
    }

    const savedProgram = localStorage.getItem('activeTrainingProgram');
    if (savedProgram && PROGRAM_DB[savedProgram]) {
      setActiveProgramId(savedProgram);
    } else {
      const suggested = Object.values(PROGRAM_DB).find(p => p.targetGoal === userGoal);
      if (suggested) setActiveProgramId(suggested.id);
    }

    const savedProgress = JSON.parse(localStorage.getItem('trainingProgress'));
    if (savedProgress && savedProgress.programId === activeProgramId) {
      setProgressData(savedProgress);
    }
  }, []);

  useEffect(() => {
    setWeeklySchedule(generateWeeklySchedule(activeProgramId));
  }, [activeProgramId]);

  // --- HANDLERS ---
  const handleSelectProgram = (id) => {
    setActiveProgramId(id);
    localStorage.setItem('activeTrainingProgram', id);
    const newProgress = { programId: id, completedDays: 0, totalDays: parseInt(PROGRAM_DB[id].duration) * 7, completedToday: false };
    setProgressData(newProgress);
    localStorage.setItem('trainingProgress', JSON.stringify(newProgress));
  };

  const handleCompleteToday = () => {
    const updated = { ...progressData, completedToday: true, completedDays: progressData.completedDays + 1 };
    setProgressData(updated);
    localStorage.setItem('trainingProgress', JSON.stringify(updated));
  };

  // --- RENDER HELPERS ---
  const activeProgram = PROGRAM_DB[activeProgramId];
  const todaysTask = weeklySchedule[currentDayIndex];
  const progressPercent = Math.min((progressData.completedDays / progressData.totalDays) * 100, 100);

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-semibold tracking-tight">Program Latihan</h1>
        <div className="w-10"></div>
      </div>

      {/* MAIN CONTAINER (Padding diseragamkan di sini agar garis tepi sejajar) */}
      <div className="pt-20 space-y-6 px-5">

        {/* 1. KARTU PROGRESS KESELURUHAN */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md mb-2 inline-block">Aktif</span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activeProgram.name}</h2>
              <p className="text-xs font-medium text-slate-400 mt-1">{activeProgram.duration} • {activeProgram.type}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <activeProgram.icon size={18} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-slate-800">{Math.round(progressPercent)}% Selesai</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hari {progressData.completedDays} dari {progressData.totalDays}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* 2. PILIH PROGRAM HORIZONTAL SCROLL (Edge-to-edge carousel) */}
        <div className="mt-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Target size={18} className="text-purple-600"/> Pilihan Program
            </h2>
          </div>
          
          {/* Trik -mx-5 dan px-5 agar bisa scroll ke ujung layar tapi tetap rata dengan widget lain */}
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar -mx-5 px-5">
            {Object.values(PROGRAM_DB).map((prog) => {
              const isRecommended = prog.targetGoal === profileGoal;
              const isActive = prog.id === activeProgramId;
              const IconComp = prog.icon;
              
              return (
                <button
                  key={prog.id}
                  onClick={() => handleSelectProgram(prog.id)}
                  className={`snap-center shrink-0 w-48 rounded-3xl p-5 text-left border transition-transform active:scale-95 flex flex-col justify-between ${
                    isActive 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-md' 
                      : 'bg-white border-slate-50 text-slate-800 shadow-sm'
                  }`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500'}`}>
                      <IconComp size={18} /> 
                    </div>
                    <h4 className="text-base font-bold mb-1 truncate">{prog.name}</h4>
                    <p className={`text-[11px] font-medium ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{prog.duration}</p>
                  </div>
                  
                  <div className="mt-4">
                    {isRecommended && !isActive && (
                       <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md">Rekomendasi</span>
                    )}
                    {isActive && (
                       <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-purple-200 bg-white/10 px-2.5 py-1 rounded-md">Terpilih</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TUGAS HARI INI */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><ListTodo size={18} className="text-purple-600"/> Tugas Hari Ini</h3>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{today.toLocaleDateString('id-ID', { weekday: 'long' })}</span>
          </div>

          {todaysTask && (
            <div className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${
              progressData.completedToday 
                ? 'bg-green-50 border-green-100' 
                : todaysTask.type === 'rest' 
                  ? 'bg-blue-50/50 border-blue-100' 
                  : 'bg-purple-50/50 border-purple-100'
            }`}>
              
              {todaysTask.type === 'rest' ? (
                 <ShieldPlus size={80} className={`absolute -right-4 -bottom-4 opacity-5 ${progressData.completedToday ? 'text-green-500' : 'text-blue-500'}`} />
              ) : (
                 <Play size={80} className={`absolute -right-4 -bottom-4 opacity-5 ${progressData.completedToday ? 'text-green-500' : 'text-purple-500'}`} />
              )}

              <div className="relative z-10 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {todaysTask.type === 'rest' ? <ShieldPlus size={16} className="text-blue-500"/> : <Activity size={16} className="text-purple-500"/>}
                    <h4 className={`text-sm font-bold tracking-tight ${progressData.completedToday ? 'text-green-700' : 'text-slate-800'}`}>
                      {todaysTask.title}
                    </h4>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed ${progressData.completedToday ? 'text-green-600/80' : 'text-slate-500'}`}>
                    {todaysTask.desc}
                  </p>
                </div>

                {todaysTask.type !== 'rest' && (
                  <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-white/50 w-max">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Target</span>
                      <span className="text-sm font-bold text-slate-800">{todaysTask.distance} km</span>
                    </div>
                  </div>
                )}

                {!progressData.completedToday ? (
                  <button 
                    onClick={handleCompleteToday}
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm ${
                      todaysTask.type === 'rest' ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-purple-600 text-white shadow-purple-200'
                    }`}
                  >
                    <CheckCircle2 size={18} /> Tandai Selesai
                  </button>
                ) : (
                  <div className="w-full py-3.5 rounded-xl bg-green-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-green-200">
                    <CheckCircle2 size={18} /> Selesai
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. JADWAL MINGGUAN (KALENDER) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-6"><CalendarDays size={18} className="text-orange-500"/> Jadwal Minggu Ini</h3>
          
          <div className="flex justify-between items-center w-full">
            {daysOfWeek.map((day, index) => {
              const isToday = index === currentDayIndex;
              const isPast = index < currentDayIndex;
              const task = weeklySchedule[index];
              const isRest = task?.type === 'rest';

              let circleClass = "text-slate-500 bg-slate-50";
              let content = <span className="text-[11px] font-semibold">{index + 1}</span>;

              if (isPast) {
                circleClass = "bg-purple-600 text-white shadow-md shadow-purple-200";
                content = <CheckCircle2 size={14} />;
              } else if (isToday) {
                circleClass = "border border-purple-200 text-purple-600 bg-purple-50 font-bold";
                content = isRest ? <ShieldPlus size={14} /> : <span className="text-[11px] font-semibold">{index + 1}</span>;
              } else if (isRest) {
                circleClass = "text-blue-500 bg-blue-50";
                content = <ShieldPlus size={14} />;
              }

              return (
                <div key={day} className="flex flex-col items-center gap-1.5 relative cursor-pointer active:scale-95 transition-transform">
                  <span className={`text-[9px] font-medium ${isToday ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>{day}</span>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                    {content}
                  </div>
                  
                  {!isPast && !isRest && !isToday && (
                     <span className="w-1 h-1 rounded-full bg-slate-300 mt-0.5 absolute -bottom-2"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileTraining;