import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Flame, Map, Users, Target, Award, Clock, ArrowRight, Zap, CheckCircle2, ShieldPlus, Activity } from 'lucide-react';

const ACTIVE_CHALLENGES = [
  {
    id: 'c1',
    title: '100KM Monthly Push',
    desc: 'Taklukkan jarak 100KM dalam satu bulan kalender.',
    target: 100,
    current: 24.5,
    daysLeft: 20,
    participants: 12453,
    rewardType: 'Medal',
    icon: Map,
    color: 'text-[#ccff00]',
    bg: 'bg-[#ccff00]/10',
    border: 'border-[#ccff00]/30'
  },
  {
    id: 'c2',
    title: 'Early Bird Streak',
    desc: 'Lari sebelum jam 6 pagi selama 5 hari berturut-turut.',
    target: 5,
    current: 3,
    daysLeft: 2,
    participants: 8302,
    rewardType: 'Badge',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-900/30',
    border: 'border-orange-800'
  }
];

const EXPLORE_CHALLENGES = [
  {
    id: 'e1',
    title: 'Weekend 10K Sprint',
    desc: 'Selesaikan lari 10K di akhir pekan ini dengan pace berapapun.',
    target: '10 KM',
    duration: 'Akhir Pekan',
    participants: 4521,
    icon: Flame,
    color: 'text-rose-400',
    bg: 'bg-rose-900/30'
  },
  {
    id: 'e2',
    title: 'Recovery Master',
    desc: 'Catat sesi peregangan atau jalan santai selama 3 hari di minggu ini.',
    target: '3 Sesi',
    duration: 'Minggu Ini',
    participants: 2100,
    icon: ShieldPlus,
    color: 'text-blue-400',
    bg: 'bg-blue-900/30'
  },
  {
    id: 'e3',
    title: 'Half Marathon Prep',
    desc: 'Lari sejauh 21.1 KM dalam satu sesi.',
    target: '21.1 KM',
    duration: 'Bulan Ini',
    participants: 15420,
    icon: Trophy,
    color: 'text-purple-400',
    bg: 'bg-purple-900/30'
  }
];

const MobileChallenges = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'explore'

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate('/mobile')} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold text-white tracking-widest uppercase">Tantangan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 px-5 space-y-6">

        {/* HERO SECTION */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 z-10 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
            <Trophy size={32} className="text-[#ccff00]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter z-10 mb-2">Pecahkan Rekormu</h2>
          <p className="text-xs font-bold text-slate-400 z-10 px-4 leading-relaxed">
            Bergabunglah dengan ribuan pelari lainnya. Selesaikan tantangan dan kumpulkan medali eksklusif.
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'active' ? 'bg-[#ccff00] text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Activity size={16} /> Sedang Berjalan
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'explore' ? 'bg-[#ccff00] text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Map size={16} /> Jelajahi
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB 1: SEDANG BERJALAN */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {ACTIVE_CHALLENGES.map((challenge) => {
                const progressPercent = Math.min((challenge.current / challenge.target) * 100, 100);
                const ChallengeIcon = challenge.icon;

                return (
                  <div key={challenge.id} className={`bg-slate-900 rounded-3xl p-5 shadow-lg border ${challenge.border} relative overflow-hidden`}>
                    
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${challenge.bg}`}>
                          <ChallengeIcon size={24} className={challenge.color} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white tracking-wide mb-1">{challenge.title}</h3>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={12}/> Sisa {challenge.daysLeft} Hari</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed">
                      {challenge.desc}
                    </p>

                    {/* Progress Bar Area */}
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Progress</p>
                          <p className="text-lg font-black text-white leading-none">
                            {challenge.current} <span className="text-xs text-slate-500">/ {challenge.target}</span>
                          </p>
                        </div>
                        <span className={`text-xl font-black ${challenge.color}`}>{Math.round(progressPercent)}%</span>
                      </div>
                      
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${challenge.color.replace('text-', 'bg-')}`} 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: JELAJAHI TANTANGAN BARU */}
          {activeTab === 'explore' && (
            <div className="space-y-4">
              {EXPLORE_CHALLENGES.map((challenge) => {
                const ChallengeIcon = challenge.icon;

                return (
                  <div key={challenge.id} className="bg-slate-900 rounded-3xl p-5 shadow-lg border border-slate-800 flex flex-col">
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${challenge.bg}`}>
                        <ChallengeIcon size={28} className={challenge.color} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wide mb-1.5">{challenge.title}</h3>
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed line-clamp-2">
                          {challenge.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-center text-center">
                        <Target size={14} className="text-[#ccff00] mx-auto mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target</span>
                        <span className="text-sm font-black text-white mt-0.5">{challenge.target}</span>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-center text-center">
                        <Clock size={14} className="text-blue-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Batas Waktu</span>
                        <span className="text-sm font-black text-white mt-0.5">{challenge.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <Users size={14} className="text-slate-400"/> {challenge.participants.toLocaleString('id-ID')} Peserta
                      </div>
                      <button className="bg-[#ccff00] text-slate-950 px-5 py-2.5 rounded-full text-xs font-black active:scale-95 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                        Ikuti
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MobileChallenges;