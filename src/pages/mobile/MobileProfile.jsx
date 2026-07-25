import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Scale, Ruler, Target, LogOut, Route, Camera, Settings, Key, Mail, X } from 'lucide-react';

const MobileProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ name: 'Lukman', height: '172', weight: '68', weeklyTarget: '30', mainTarget: 'speed' });
  const [photo, setPhoto] = useState("https://i.pravatar.cc/150?img=11");
  
  // State Pengaturan Akun
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [accountData, setAccountData] = useState({ email: 'lukman@runapp.com', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => { if (e.target.files[0]) setPhoto(URL.createObjectURL(e.target.files[0])); };
  const handleSave = (e) => { e.preventDefault(); alert('Profil berhasil disimpan!'); };

  // Fungsi Logout
  const handleLogout = () => {
    if(window.confirm('Yakin ingin keluar?')) navigate('/login');
  };

  const handleAccountSave = (e) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    alert('Email / Password berhasil diperbarui!');
  };

  return (
    <div className="pt-8 px-5 pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Profil Saya</h1>
        <button onClick={handleLogout} className="text-xs font-medium text-red-500 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
          <LogOut size={14} /> Keluar
        </button>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
            <img src={photo} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm active:scale-90 transition-transform">
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-1.5 text-slate-500 hover:text-purple-600 text-[11px] font-semibold mt-4 bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
          <Settings size={12}/> Pengaturan Akun (Email & Password)
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 ml-2">Nama Lengkap</label>
          <div className="bg-white rounded-2xl p-2 flex items-center gap-3 shadow-sm border border-slate-50">
            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><User size={18} /></div>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full text-slate-800 font-medium bg-transparent outline-none text-base pr-4" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
             <label className="text-xs font-medium text-slate-500 ml-2">Tinggi (cm)</label>
             <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-slate-50">
               <Ruler size={18} className="text-orange-400" />
               <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full text-slate-800 font-semibold bg-transparent outline-none text-lg text-center" required />
             </div>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-medium text-slate-500 ml-2">Berat (kg)</label>
             <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-slate-50">
               <Scale size={18} className="text-purple-500" />
               <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full text-slate-800 font-semibold bg-transparent outline-none text-lg text-center" required />
             </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-500 ml-2">Target Jarak Mingguan (km)</label>
          <div className="bg-white rounded-2xl p-2 flex items-center gap-3 shadow-sm border border-slate-50">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Route size={18} /></div>
            <input type="number" step="0.1" name="weeklyTarget" value={formData.weeklyTarget} onChange={handleChange} className="w-full text-slate-800 font-semibold bg-transparent outline-none text-lg pr-4" required />
          </div>
        </div>
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 mb-2 ml-2">
            <Target size={16} className="text-slate-400" />
            <label className="text-xs font-medium text-slate-500">Fokus Analisis AI</label>
          </div>
          {[{ id: 'weight_loss', label: 'Penurunan Berat Badan' }, { id: 'speed', label: 'Peningkatan Kecepatan' }, { id: 'endurance', label: 'Lari Jarak Jauh' }].map((target) => (
            <label key={target.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer shadow-sm border ${formData.mainTarget === target.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-50'}`}>
              <span className="text-sm font-medium">{target.label}</span>
              <input type="radio" name="mainTarget" value={target.id} checked={formData.mainTarget === target.id} onChange={handleChange} className="hidden"/>
            </label>
          ))}
        </div>
        <div className="pt-6 pb-8">
          <button type="submit" className="w-full bg-slate-800 text-white font-medium text-base py-4 rounded-full shadow-lg shadow-slate-200 active:scale-95 transition-transform">
            Simpan Perubahan Fisik
          </button>
        </div>
      </form>

      {/* Modal Pengaturan Akun */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Pengaturan Akun</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><X size={18}/></button>
            </div>
            <form onSubmit={handleAccountSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Ubah Email</label>
                <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3">
                  <Mail size={16} className="text-slate-400" />
                  <input type="email" value={accountData.email} onChange={(e) => setAccountData({...accountData, email: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Password Baru (Opsional)</label>
                <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3">
                  <Key size={16} className="text-slate-400" />
                  <input type="password" placeholder="Kosongkan jika tidak diubah" value={accountData.password} onChange={(e) => setAccountData({...accountData, password: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" />
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white font-medium text-base py-4 rounded-full shadow-md mt-4">Update Akun</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;