import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Scale, Ruler, Target, LogOut, Route, Camera, Settings, Key, Mail, X, Activity, CalendarDays, Flame, Download, Compass, BarChart2, Trophy, ChevronRight } from 'lucide-react';

const MobileProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ 
    name: 'Lukman', height: '172', weight: '68', age: '28', gender: 'L',
    weeklyTarget: '30', targetWeight: '65', mainTarget: 'speed', unitPref: 'km'      
  });
  
  const [photo, setPhoto] = useState("https://i.pravatar.cc/150?img=11");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState({ email: 'lukman@runapp.com', currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) { setFormData(prev => ({ ...prev, ...savedProfile })); }
  }, []);

  // Penyesuaian tema gelap untuk kategori BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return { score: 0, category: '-', color: 'text-slate-500', bg: 'bg-slate-900', border: 'border-slate-800' };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category = ''; let color = ''; let bg = ''; let border = '';
    if (bmi < 18.5) { category = 'Kekurangan Berat'; color = 'text-blue-400'; bg = 'bg-blue-900/30'; border = 'border-blue-800'; } 
    else if (bmi >= 18.5 && bmi <= 24.9) { category = 'Normal Ideal'; color = 'text-[#ccff00]'; bg = 'bg-[#ccff00]/10'; border = 'border-[#ccff00]/30'; } 
    else if (bmi >= 25 && bmi <= 29.9) { category = 'Kelebihan Berat'; color = 'text-yellow-400'; bg = 'bg-yellow-900/30'; border = 'border-yellow-800'; } 
    else { category = 'Obesitas'; color = 'text-red-400'; bg = 'bg-red-900/30'; border = 'border-red-800'; }
    return { score: bmi, category, color, bg, border };
  };

  const bmiData = calculateBMI(formData.weight, formData.height);
  const w = parseFloat(formData.weight) || 0; const h = parseFloat(formData.height) || 0; const a = parseInt(formData.age) || 0;
  
  let bmr = (10 * w) + (6.25 * h) - (5 * a);
  bmr = formData.gender === 'L' ? bmr + 5 : bmr - 161;
  const tdee = Math.round(bmr * 1.375); 
  const idealWeightMin = (18.5 * (h/100) * (h/100)).toFixed(1);
  const idealWeightMax = (24.9 * (h/100) * (h/100)).toFixed(1);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => { if (e.target.files[0]) setPhoto(URL.createObjectURL(e.target.files[0])); };
  const handleSave = (e) => { e.preventDefault(); localStorage.setItem('userProfile', JSON.stringify(formData)); alert('Profil dan preferensi berhasil disimpan!'); };
  const handleExportData = () => { alert('Laporan akan diunduh dalam format CSV/Excel (Simulasi).'); };
  const handleLogout = async () => { if(window.confirm('Yakin ingin keluar?')) { navigate('/login'); } };
  
  const handleAccountSave = async (e) => {
    e.preventDefault();
    if (accountData.newPassword && accountData.newPassword !== accountData.confirmPassword) { alert('Konfirmasi password baru tidak cocok!'); return; }
    setIsLoading(true);
    setTimeout(() => {
      alert('Email dan Password berhasil diperbarui!');
      setIsSettingsOpen(false);
      setAccountData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="pt-8 px-5 pb-24 bg-slate-950 min-h-screen text-white font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold tracking-tight">Profil Saya</h1>
        <button onClick={handleLogout} className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 bg-red-900/30 px-3 py-1.5 rounded-full active:scale-95 transition-transform border border-red-800">
          <LogOut size={14} /> Keluar
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-900 shadow-lg bg-slate-800">
            <img src={photo} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#ccff00] rounded-full flex items-center justify-center text-slate-950 border-2 border-slate-950 shadow-md active:scale-90 transition-transform">
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-[11px] font-bold bg-slate-900 border border-slate-800 shadow-sm px-4 py-2 rounded-xl transition-colors active:scale-95">
          <Settings size={14}/> Pengaturan Akun
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div onClick={() => navigate('/mobile/stats')} className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col justify-center cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group">
           <div className="flex items-center justify-between mb-2">
             <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><BarChart2 size={18} /></div>
             <ChevronRight size={16} className="text-slate-500" />
           </div>
           <h3 className="text-xs font-bold text-white">Statistik</h3>
           <p className="text-[9px] font-bold text-slate-400 mt-0.5">Lihat progres lari</p>
        </div>
        
        <div onClick={() => navigate('/mobile/pr')} className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col justify-center cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden group">
           <div className="flex items-center justify-between mb-2">
             <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Trophy size={18} /></div>
             <ChevronRight size={16} className="text-slate-500" />
           </div>
           <h3 className="text-xs font-bold text-white">Ruang Piala</h3>
           <p className="text-[9px] font-bold text-slate-400 mt-0.5">Rekor & pencapaian</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-3 ml-1">Kalkulasi Metrik Tubuh</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className={`col-span-2 rounded-[1.5rem] p-5 border flex items-center justify-between shadow-lg transition-colors ${bmiData.bg} ${bmiData.border}`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${bmiData.color}`}>Indeks Massa Tubuh (BMI)</p>
                <h3 className={`text-base font-bold tracking-tight ${bmiData.color}`}>{bmiData.category}</h3>
              </div>
              <span className={`text-3xl font-black tracking-tighter ${bmiData.color}`}>{bmiData.score}</span>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity size={14} className="text-orange-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">BMR (Basal)</p>
              </div>
              <h3 className="text-lg font-black text-white">{Math.round(bmr)} <span className="text-[10px] font-bold text-slate-500">kcal</span></h3>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame size={14} className="text-purple-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TDEE (Total)</p>
              </div>
              <h3 className="text-lg font-black text-white">{tdee} <span className="text-[10px] font-bold text-slate-500">kcal</span></h3>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-3 ml-1">Data Diri & Fisik</h2>
          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 space-y-4">
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Nama Lengkap</label>
              <div className="bg-slate-950 rounded-xl p-1 flex items-center gap-3 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-[#ccff00] shadow-inner"><User size={16} /></div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm pr-3" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Usia</label>
                <div className="bg-slate-950 rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <CalendarDays size={16} className="text-slate-500" />
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm text-center" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Gender</label>
                <div className="bg-slate-950 rounded-xl px-2 py-3 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-transparent text-white font-bold outline-none text-sm text-center appearance-none">
                    <option value="L">Pria</option>
                    <option value="P">Wanita</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Tinggi (cm)</label>
                <div className="bg-slate-950 rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <Ruler size={16} className="text-slate-500" />
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm text-center" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Berat (kg)</label>
                <div className="bg-slate-950 rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <Scale size={16} className="text-slate-500" />
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm text-center" required />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ccff00] mb-3 ml-1">Target & Preferensi</h2>
          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 space-y-4">
            
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Berat (kg)</label>
                <span className="text-[9px] font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/20">Ideal: {idealWeightMin} - {idealWeightMax} kg</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-1 flex items-center gap-3 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-[#ccff00] shadow-inner"><Target size={16} /></div>
                <input type="number" step="0.1" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm pr-3" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Target / Mgg</label>
                <div className="bg-slate-950 rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <Route size={16} className="text-slate-500" />
                  <input type="number" step="0.1" name="weeklyTarget" value={formData.weeklyTarget} onChange={handleChange} className="w-full text-white font-bold bg-transparent outline-none text-sm text-center" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Satuan Jarak</label>
                <div className="bg-slate-950 rounded-xl px-2 py-3 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <select name="unitPref" value={formData.unitPref} onChange={handleChange} className="w-full bg-transparent text-white font-bold outline-none text-sm text-center appearance-none">
                    <option value="km">Kilo (KM)</option>
                    <option value="mile">Mil (Mi)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00] mb-2 block flex items-center gap-1.5">
                <Compass size={14} className="text-[#ccff00]" /> Fokus Analisis AI & Latihan
              </label>
              <div className="space-y-2">
                {[
                  { id: 'weight_loss', label: 'Penurunan Berat Badan' }, 
                  { id: 'speed', label: 'Peningkatan Kecepatan' }, 
                  { id: 'endurance', label: 'Ketahanan Jarak Jauh' }
                ].map((target) => (
                  <label key={target.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border ${formData.mainTarget === target.id ? 'bg-[#ccff00] text-slate-950 border-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.3)]' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                    <span className="text-xs font-black">{target.label}</span>
                    <input type="radio" name="mainTarget" value={target.id} checked={formData.mainTarget === target.id} onChange={handleChange} className="hidden"/>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button type="submit" className="w-full bg-[#ccff00] text-slate-950 font-bold text-sm py-4 rounded-2xl shadow-[0_0_15px_rgba(204,255,0,0.3)] active:scale-95 transition-transform">
            Simpan Profil & Preferensi
          </button>
          
          <button type="button" onClick={handleExportData} className="w-full bg-slate-900 text-slate-300 border border-slate-700 font-bold text-sm py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:bg-slate-800 transition-colors">
            <Download size={18} /> Export Data Lari (.CSV)
          </button>
        </div>
      </form>

      {/* MODAL PENGATURAN AKUN */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-white">Pengaturan Akun</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleAccountSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00] ml-1">Email Akun</label>
                <div className="bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-1 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                  <Mail size={16} className="text-[#ccff00]" />
                  <input type="email" value={accountData.email} onChange={(e) => setAccountData({...accountData, email: e.target.value})} className="w-full bg-transparent py-3 outline-none font-bold text-sm text-white" required />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-2">
                <p className="text-[10px] text-slate-500 font-bold mb-3 ml-1">Kosongkan kolom di bawah jika tidak mengubah password.</p>
                <div className="space-y-3">
                  <div className="bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-1 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                    <Key size={16} className="text-slate-500" />
                    <input type="password" placeholder="Password Saat Ini" value={accountData.currentPassword} onChange={(e) => setAccountData({...accountData, currentPassword: e.target.value})} className="w-full bg-transparent py-3 outline-none font-bold text-sm text-white placeholder-slate-600" />
                  </div>
                  <div className="bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-1 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                    <Key size={16} className="text-slate-500" />
                    <input type="password" placeholder="Password Baru" value={accountData.newPassword} onChange={(e) => setAccountData({...accountData, newPassword: e.target.value})} className="w-full bg-transparent py-3 outline-none font-bold text-sm text-white placeholder-slate-600" />
                  </div>
                  <div className="bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-1 border border-slate-800 focus-within:border-[#ccff00] transition-all">
                    <Key size={16} className="text-slate-500" />
                    <input type="password" placeholder="Konfirmasi Password Baru" value={accountData.confirmPassword} onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})} className="w-full bg-transparent py-3 outline-none font-bold text-sm text-white placeholder-slate-600" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`w-full text-slate-950 font-bold text-sm py-4 rounded-2xl shadow-[0_0_15px_rgba(204,255,0,0.3)] mt-6 transition-colors ${isLoading ? 'bg-slate-600' : 'bg-[#ccff00] active:scale-95'}`}>
                {isLoading ? 'Menyimpan...' : 'Perbarui Kredensial'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;