import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, CalendarDays, CheckCircle2, Play, Activity, Zap, ShieldPlus, Map, Trophy, ListTodo, Flame } from 'lucide-react';

const PROGRAM_DB = {
  '5k': { id: '5k', name: 'Program 5K', duration: '8 Minggu', type: 'Beginner', targetGoal: 'speed', icon: Zap },
  '10k': { id: '10k', name: 'Program 10K', duration: '10 Minggu', type: 'Intermediate', targetGoal: 'distance', icon: Activity },
  'hm': { id: 'hm', name: 'Half Marathon', duration: '12 Minggu', type: 'Advanced', targetGoal: 'distance', icon: Map },
  'marathon': { id: 'marathon', name: 'Marathon', duration: '16 Minggu', type: 'Expert', targetGoal: 'distance', icon: Trophy },
  'fatloss': { id: 'fatloss', name: 'Fat Loss Run', duration: '8 Minggu', type: 'All Levels', targetGoal: 'weight_loss', icon: Flame } 
};

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

  const [profileGoal, setProfileGoal] = useState('speed');
  const [activeProgramId, setActiveProgramId] = useState('5k');
  const [progressData, setProgressData] = useState({ completedDays: 12, totalDays: 56, completedToday: false });
  
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; 
  const [weeklySchedule, setWeeklySchedule] = useState([]);

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

  const activeProgram = PROGRAM_DB[activeProgramId];
  const todaysTask = weeklySchedule[currentDayIndex];
  const progressPercent = Math.min((progressData.completedDays / progressData.totalDays) * 100, 100);

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold tracking-tight">Program Latihan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 space-y-6 px-5">

        {/* 1. KARTU PROGRESS KESELURUHAN */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950 bg-[#ccff00] px-2.5 py-1 rounded-md mb-2 inline-block">Aktif</span>
              <h2 className="text-2xl font-black text-white tracking-tight">{activeProgram.name}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">{activeProgram.duration} • {activeProgram.type}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[#ccff00] border border-slate-700">
              <activeProgram.icon size={18} />
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-black text-[#ccff00]">{Math.round(progressPercent)}% Selesai</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hari {progressData.completedDays} dari {progressData.totalDays}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#ccff00] rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(204,255,0,0.5)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* 2. PILIH PROGRAM HORIZONTAL SCROLL */}
        <div className="mt-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Target size={18} className="text-[#ccff00]"/> Pilihan Program
            </h2>
          </div>
          
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
                      ? 'bg-slate-800 border-slate-700 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-white shadow-sm'
                  }`}
                >
                  <div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isActive ? 'bg-[#ccff00] text-slate-950 shadow-[0_0_10px_rgba(204,255,0,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                      <IconComp size={18} /> 
                    </div>
                    <h4 className="text-base font-black mb-1 truncate">{prog.name}</h4>
                    <p className={`text-[11px] font-bold ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{prog.duration}</p>
                  </div>
                  
                  <div className="mt-4">
                    {isRecommended && !isActive && (
                       <span className="inline-block text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-900/30 border border-orange-800 px-2.5 py-1 rounded-md">Rekomendasi</span>
                    )}
                    {isActive && (
                       <span className="inline-block text-[9px] font-black uppercase tracking-widest text-slate-950 bg-[#ccff00] px-2.5 py-1 rounded-md">Terpilih</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TUGAS HARI INI */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><ListTodo size={18} className="text-[#ccff00]"/> Tugas Hari Ini</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{today.toLocaleDateString('id-ID', { weekday: 'long' })}</span>
          </div>

          {todaysTask && (
            <div className={`rounded-2xl p-5 border relative overflow-hidden transition-all ${
              progressData.completedToday 
                ? 'bg-green-900/20 border-green-800' 
                : todaysTask.type === 'rest' 
                  ? 'bg-blue-900/20 border-blue-800' 
                  : 'bg-slate-800 border-slate-700'
            }`}>
              
              {todaysTask.type === 'rest' ? (
                 <ShieldPlus size={80} className={`absolute -right-4 -bottom-4 opacity-[0.03] ${progressData.completedToday ? 'text-green-500' : 'text-blue-500'}`} />
              ) : (
                 <Play size={80} className={`absolute -right-4 -bottom-4 opacity-[0.03] ${progressData.completedToday ? 'text-green-500' : 'text-white'}`} />
              )}

              <div className="relative z-10 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {todaysTask.type === 'rest' ? <ShieldPlus size={16} className="text-blue-400"/> : <Activity size={16} className="text-[#ccff00]"/>}
                    <h4 className={`text-base font-black tracking-tight ${progressData.completedToday ? 'text-green-400' : 'text-white'}`}>
                      {todaysTask.title}
                    </h4>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed ${progressData.completedToday ? 'text-green-500/80' : 'text-slate-400'}`}>
                    {todaysTask.desc}
                  </p>
                </div>

                {todaysTask.type !== 'rest' && (
                  <div className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 w-max">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">Target Jarak</span>
                      <span className="text-lg font-black text-white">{todaysTask.distance} km</span>
                    </div>
                  </div>
                )}

                {!progressData.completedToday ? (
                  <button 
                    onClick={handleCompleteToday}
                    className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg ${
                      todaysTask.type === 'rest' ? 'bg-blue-500 text-white' : 'bg-[#ccff00] text-slate-950 shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                    }`}
                  >
                    <CheckCircle2 size={18} /> Tandai Selesai
                  </button>
                ) : (
                  <div className="w-full py-4 rounded-xl bg-green-500 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 size={18} /> Selesai
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. JADWAL MINGGUAN (KALENDER) */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6"><CalendarDays size={18} className="text-orange-500"/> Jadwal Minggu Ini</h3>
          
          <div className="flex justify-between items-center w-full">
            {daysOfWeek.map((day, index) => {
              const isToday = index === currentDayIndex;
              const isPast = index < currentDayIndex;
              const task = weeklySchedule[index];
              const isRest = task?.type === 'rest';

              let circleClass = "text-slate-500 bg-slate-800 border border-slate-700";
              let content = <span className="text-[11px] font-bold">{index + 1}</span>;

              if (isPast) {
                circleClass = "bg-green-500 text-slate-950 shadow-[0_0_8px_rgba(34,197,94,0.4)] border-none";
                content = <CheckCircle2 size={14} />;
              } else if (isToday) {
                circleClass = "border-2 border-[#ccff00] text-[#ccff00] bg-slate-900 font-black shadow-[0_0_10px_rgba(204,255,0,0.3)]";
                content = isRest ? <ShieldPlus size={14} /> : <span className="text-[11px] font-black">{index + 1}</span>;
              } else if (isRest) {
                circleClass = "text-blue-400 bg-blue-900/30 border border-blue-800";
                content = <ShieldPlus size={14} />;
              }

              return (
                <div key={day} className="flex flex-col items-center gap-1.5 relative cursor-pointer active:scale-95 transition-transform">
                  <span className={`text-[9px] font-bold ${isToday ? 'text-[#ccff00]' : 'text-slate-500'}`}>{day}</span>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                    {content}
                  </div>
                  
                  {!isPast && !isRest && !isToday && (
                     <span className="w-1 h-1 rounded-full bg-slate-700 mt-0.5 absolute -bottom-2"></span>
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