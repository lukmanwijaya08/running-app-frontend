import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Activity, Zap } from 'lucide-react';

const MobileAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulasi Login/Register berhasil
    navigate('/mobile');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 pb-12 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-100 rounded-full opacity-50 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-4 transform rotate-12">
            <Activity size={32} className="-rotate-12" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">RunApp</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Lacak dan analisis larimu.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><User size={18} /></div>
                <input type="text" name="name" placeholder="Nama Lengkap" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 pr-4" required />
              </div>
            )}
            
            <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Mail size={18} /></div>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 pr-4" required />
            </div>

            <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Lock size={18} /></div>
              <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 pr-4" required />
            </div>

            <button type="submit" className="w-full bg-purple-600 text-white font-medium text-base py-4 rounded-full shadow-md shadow-purple-200 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2">
              {isLogin ? 'Masuk' : 'Daftar Sekarang'} <Zap size={18} className="text-purple-200" />
            </button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-6">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-purple-600 font-semibold">
              {isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileAuth;