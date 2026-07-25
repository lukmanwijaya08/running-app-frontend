import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Scale, Ruler, Target, LogOut, Route, Camera, Settings, Key, Mail, X } from 'lucide-react';
import axios from '../../utils/axios'; // Pastikan path ini sesuai dengan struktur foldermu

const MobileProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ name: 'Lukman', height: '172', weight: '68', weeklyTarget: '30', mainTarget: 'speed' });
  const [photo, setPhoto] = useState("https://i.pravatar.cc/150?img=11");
  
  // State Pengaturan Akun
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState({ 
    email: 'lukman@runapp.com', 
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // (Opsional) Mengambil data email terbaru dari backend saat komponen dimuat
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/user');
        setAccountData(prev => ({ ...prev, email: response.data.email }));
        setFormData(prev => ({ ...prev, name: response.data.name }));
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => { if (e.target.files[0]) setPhoto(URL.createObjectURL(e.target.files[0])); };
  
  const handleSave = (e) => { 
    e.preventDefault(); 
    // Logika simpan profil fisik bisa ditambahkan ke Axios di sini
    alert('Profil fisik berhasil disimpan!'); 
  };

  const handleLogout = async () => {
    if(window.confirm('Yakin ingin keluar?')) {
      try {
        await axios.post('/logout');
        navigate('/login');
      } catch (error) {
        navigate('/login'); // Tetap redirect meski API gagal
      }
    }
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    
    // Validasi Password Baru
    if (accountData.newPassword && accountData.newPassword !== accountData.confirmPassword) {
      alert('Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: accountData.email,
      };

      // Hanya kirim password jika pengguna mengisi input password
      if (accountData.newPassword) {
        payload.current_password = accountData.currentPassword;
        payload.password = accountData.newPassword;
        payload.password_confirmation = accountData.confirmPassword;
      }

      // Sesuaikan URL endpoint dengan route di backend Laravel (misal: /profile)
      await axios.put('/profile', payload);
      
      alert('Email dan Password berhasil diperbarui!');
      setIsSettingsOpen(false);
      
      // Kosongkan form password setelah berhasil
      setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat memperbarui akun.');
    } finally {
      setIsLoading(false);
    }
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

      {/* Modal Pengaturan Akun Terintegrasi */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Pengaturan Akun</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleAccountSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Email</label>
                <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3 border border-slate-100">
                  <Mail size={16} className="text-slate-400" />
                  <input type="email" value={accountData.email} onChange={(e) => setAccountData({...accountData, email: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" required />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-2">
                <p className="text-[10px] text-slate-400 font-medium mb-3 ml-1">Kosongkan jika tidak ingin mengubah password</p>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3 border border-slate-100">
                    <Key size={16} className="text-slate-400" />
                    <input type="password" placeholder="Password Saat Ini" value={accountData.currentPassword} onChange={(e) => setAccountData({...accountData, currentPassword: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" />
                  </div>

                  <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3 border border-slate-100">
                    <Key size={16} className="text-slate-400" />
                    <input type="password" placeholder="Password Baru" value={accountData.newPassword} onChange={(e) => setAccountData({...accountData, newPassword: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" />
                  </div>

                  <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3 border border-slate-100">
                    <Key size={16} className="text-slate-400" />
                    <input type="password" placeholder="Konfirmasi Password Baru" value={accountData.confirmPassword} onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})} className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`w-full text-white font-medium text-base py-4 rounded-full shadow-md mt-4 transition-colors ${isLoading ? 'bg-purple-400' : 'bg-purple-600 active:scale-[0.98]'}`}>
                {isLoading ? 'Menyimpan...' : 'Update Akun'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;