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
    navigate('/mobile');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-6 pb-12 relative overflow-hidden font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Background Ornaments */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-800 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#ccff00]/10 rounded-full opacity-50 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#ccff00] rounded-2xl flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(204,255,0,0.4)] mb-4 transform rotate-12">
            <Activity size={32} className="-rotate-12" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">RUNAPP</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Lacak & Kuasai Jalanan</p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Selamat Datang Kembali!' : 'Mulai Petualangan Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="bg-slate-950 rounded-2xl p-2 flex items-center gap-3 border border-slate-800 focus-within:border-[#ccff00] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#ccff00] shadow-inner"><User size={18} /></div>
                <input type="text" name="name" placeholder="Nama Lengkap" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-bold text-white pr-4 placeholder-slate-500" required />
              </div>
            )}
            
            <div className="bg-slate-950 rounded-2xl p-2 flex items-center gap-3 border border-slate-800 focus-within:border-[#ccff00] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#ccff00] shadow-inner"><Mail size={18} /></div>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-bold text-white pr-4 placeholder-slate-500" required />
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 flex items-center gap-3 border border-slate-800 focus-within:border-[#ccff00] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#ccff00] shadow-inner"><Lock size={18} /></div>
              <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-bold text-white pr-4 placeholder-slate-500" required />
            </div>

            <button type="submit" className="w-full bg-[#ccff00] text-slate-950 font-bold text-sm py-4 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4">
              {isLogin ? 'Masuk ke Dashboard' : 'Daftar Sekarang'} <Zap size={18} className="text-slate-950" />
            </button>
          </form>

          <p className="text-center text-xs font-bold text-slate-400 mt-6">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#ccff00] hover:underline transition-all">
              {isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileAuth;