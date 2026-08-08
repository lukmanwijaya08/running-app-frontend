import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BatteryCharging, Activity, ShieldPlus, HeartPulse, Stethoscope, Save, Move, Wind, CheckCircle2 } from 'lucide-react';

const STRETCHING_GUIDE = [
  { id: 1, title: 'Quad Stretch (Berdiri)', duration: '30 dtk / kaki', desc: 'Tarik tumit ke arah bokong, jaga lutut tetap sejajar. Fokus pada regangan paha depan.' },
  { id: 2, title: 'Calf Stretch (Dinding)', duration: '30 dtk / kaki', desc: 'Satu kaki di depan, tekuk lutut depan. Kaki belakang lurus, tumit menempel di lantai.' },
  { id: 3, title: 'Hamstring Stretch', duration: '45 dtk / kaki', desc: 'Duduk dengan satu kaki lurus, kaki lainnya ditekuk ke paha dalam. Condongkan badan ke depan.' },
  { id: 4, title: 'Glute Stretch (Angka 4)', duration: '30 dtk / kaki', desc: 'Berbaring, silangkan pergelangan kaki di atas lutut yang berlawanan. Tarik paha ke arah dada.' }
];

const COOLING_DOWN_GUIDE = [
  { id: 1, title: 'Jalan Santai', duration: '5 - 10 Menit', desc: 'Turunkan detak jantung secara bertahap dengan berjalan lambat sambil mengatur napas.' },
  { id: 2, title: 'Deep Breathing', duration: '2 Menit', desc: 'Tarik napas dalam 4 detik, tahan 2 detik, hembuskan perlahan 6 detik.' },
  { id: 3, title: 'Legs Up the Wall', duration: '5 Menit', desc: 'Berbaring dan sandarkan kedua kaki lurus ke tembok. Membantu melancarkan sirkulasi darah kembali.' }
];

const MobileRecovery = () => {
  const navigate = useNavigate();

  const [readinessScore, setReadinessScore] = useState(85); 
  const [rpeScore, setRpeScore] = useState(5);
  const [painLevel, setPainLevel] = useState(1);
  const [painNotes, setPainNotes] = useState('');
  const [activeTab, setActiveTab] = useState('stretch'); 
  const [isSaved, setIsSaved] = useState(false);

  let readinessStatus = "Optimal";
  let readinessColor = "text-[#ccff00]"; // Hijau neon untuk tema gelap
  let readinessBg = "bg-[#ccff00]/10";
  let readinessStroke = "#ccff00"; 

  if (readinessScore < 50) {
    readinessStatus = "Butuh Istirahat";
    readinessColor = "text-rose-500";
    readinessBg = "bg-rose-900/30";
    readinessStroke = "#f43f5e";
  } else if (readinessScore < 75) {
    readinessStatus = "Pemulihan Ringan";
    readinessColor = "text-orange-400";
    readinessBg = "bg-orange-900/30";
    readinessStroke = "#fb923c";
  }

  const handleSaveLog = (e) => {
    e.preventDefault();
    const recoveryLog = {
      date: new Date().toISOString(),
      rpe: rpeScore,
      painLevel: painLevel,
      notes: painNotes
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('recoveryLogs') || '[]');
    localStorage.setItem('recoveryLogs', JSON.stringify([recoveryLog, ...existingLogs]));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setPainNotes('');
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold tracking-tight">Recovery & Kesiapan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 space-y-6">

        {/* 1. KARTU READINESS & RECOVERY SCORE */}
        <div className="px-5">
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 relative overflow-hidden flex flex-col items-center">
            
            <div className="flex w-full justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BatteryCharging size={18} className="text-blue-400"/> Kesiapan Lari
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${readinessBg} ${readinessColor} border-${readinessColor.split('-')[1]}-800`}>
                {readinessStatus}
              </span>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center my-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="76" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="88" cy="88" r="76" 
                  stroke={readinessStroke} 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 76} 
                  strokeDashoffset={(2 * Math.PI * 76) - (readinessScore / 100) * (2 * Math.PI * 76)} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <ShieldPlus size={24} className={`${readinessColor} mb-1`} />
                <span className="text-5xl font-black text-white tracking-tighter">{readinessScore}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-400 text-center mt-2 px-4 leading-relaxed">
              Berdasarkan akumulasi beban latihan dan istirahat Anda, kondisi otot Anda saat ini sangat baik untuk latihan.
            </p>
          </div>
        </div>

        {/* 2. FORM CATATAN RPE & NYERI (Log Interaktif) */}
        <div className="px-5">
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
              <Activity size={18} className="text-[#ccff00]"/> Catat Kondisi Fisik
            </h3>

            <form onSubmit={handleSaveLog} className="space-y-6">
              
              {/* Slider RPE */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">RPE (Tingkat Kelelahan)</label>
                  <span className="text-lg font-black text-[#ccff00]">{rpeScore}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={rpeScore} 
                  onChange={(e) => setRpeScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                />
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500 uppercase">
                  <span>Sangat Ringan</span>
                  <span>Maksimal</span>
                </div>
              </div>

              {/* Slider Nyeri */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tingkat Nyeri Otot</label>
                  <span className="text-lg font-black text-orange-500">{painLevel}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={painLevel} 
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500 uppercase">
                  <span>Tidak Ada Nyeri</span>
                  <span>Sangat Nyeri</span>
                </div>
              </div>

              {/* Catatan Area Nyeri */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Lokasi / Detail Nyeri (Opsional)</label>
                <div className="bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-[#ccff00] focus-within:ring-1 focus-within:ring-[#ccff00] transition-all p-4">
                  <textarea 
                    rows="2"
                    value={painNotes}
                    onChange={(e) => setPainNotes(e.target.value)}
                    placeholder="Contoh: Nyeri ringan di betis kanan setelah lari kemarin..."
                    className="w-full bg-transparent outline-none text-sm font-bold text-white resize-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Tombol Simpan */}
              <button 
                type="submit" 
                className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                  isSaved ? 'bg-green-500 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-[#ccff00] text-slate-950 shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                }`}
              >
                {isSaved ? <><CheckCircle2 size={18}/> Tersimpan</> : <><Save size={18}/> Simpan Catatan Harian</>}
              </button>
            </form>
          </div>
        </div>

        {/* 3. PANDUAN STRETCHING & COOLING DOWN (Sistem Tab) */}
        <div className="px-5 pb-6">
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Stethoscope size={18} className="text-teal-400"/> Panduan Pemulihan
            </h3>

            {/* Tab Navigasi */}
            <div className="flex bg-slate-950 rounded-2xl p-1 mb-6 border border-slate-800">
              <button 
                onClick={() => setActiveTab('stretch')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'stretch' ? 'bg-[#ccff00] text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Move size={14} /> Stretching
              </button>
              <button 
                onClick={() => setActiveTab('cooldown')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'cooldown' ? 'bg-[#ccff00] text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Wind size={14} /> Cooling Down
              </button>
            </div>

            {/* Konten Tab */}
            <div className="space-y-4">
              {(activeTab === 'stretch' ? STRETCHING_GUIDE : COOLING_DOWN_GUIDE).map((guide, index) => (
                <div key={guide.id} className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black mt-0.5 border ${
                    activeTab === 'stretch' ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-blue-900/30 text-blue-400 border-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{guide.title}</h4>
                    <span className="inline-block mt-1 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {guide.duration}
                    </span>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                      {guide.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileRecovery;