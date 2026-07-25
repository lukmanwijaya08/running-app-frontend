import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UploadCloud, Map, Clock, CheckCircle, Zap, Calendar, TrendingUp, Activity } from 'lucide-react';

const MobileAddActivity = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('manual'); 
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', elevation: '', gpxFile: null });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert('Aktivitas berhasil disimpan!'); navigate('/mobile'); };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-semibold text-slate-800">Tambah Aktivitas</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-24 px-5 max-w-md mx-auto">
        
        <div className="bg-slate-200/60 p-1 rounded-full flex mb-8">
          <button onClick={() => setInputType('manual')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${inputType === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
            Input Manual
          </button>
          <button onClick={() => setInputType('gpx')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${inputType === 'gpx' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
            Upload GPX
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-50">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Judul Aktivitas</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Misal: Lari Pagi Sudirman" className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-slate-800 text-sm shadow-inner" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Deskripsi (Opsional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Bagaimana lari Anda hari ini?" rows="2" className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-slate-800 text-sm shadow-inner resize-none" />
            </div>
          </div>

          {inputType === 'gpx' && (
            <div onClick={() => fileInputRef.current.click()} className="w-full bg-white border border-dashed border-slate-300 hover:border-purple-300 rounded-3xl p-10 cursor-pointer transition-colors flex flex-col items-center justify-center text-center shadow-sm">
              <input type="file" ref={fileInputRef} onChange={(e) => setFormData({...formData, gpxFile: e.target.files[0]})} accept=".gpx,.xml" className="hidden" />
              {formData.gpxFile ? (
                <><CheckCircle size={40} className="text-green-500 mb-3" /><p className="font-medium text-slate-800">{formData.gpxFile.name}</p></>
              ) : (
                <><div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4"><UploadCloud size={24} className="text-purple-600" /></div><p className="font-medium text-slate-800">Ketuk untuk pilih file GPX</p></>
              )}
            </div>
          )}

          {inputType === 'manual' && (
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Calendar size={14}/> Tanggal & Waktu Mulai</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl outline-none font-medium text-sm text-slate-800 shadow-inner" required={inputType === 'manual'} />
              </div>
              
              {/* Input Jarak Tanpa Koma */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Map size={14}/> Jarak Total</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="0" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xl font-bold text-slate-300">,</span>
                  <input type="number" placeholder="00" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">Kilometer (km)</span>
                </div>
              </div>

              {/* Input Waktu Tanpa Titik Dua */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Clock size={14}/> Total Waktu Bergerak</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">(J : M : D)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Input Pace Tanpa Titik Dua */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Activity size={14}/> Pace</label>
                  <div className="flex items-center gap-1">
                    <input type="number" placeholder="00" className="w-12 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                    <span className="font-bold text-slate-300">:</span>
                    <input type="number" placeholder="00" className="w-12 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  </div>
                </div>

                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><TrendingUp size={14}/> Elevasi (m)</label>
                  <input type="number" name="elevation" value={formData.elevation} onChange={handleChange} placeholder="0" className="w-full bg-slate-50 px-4 py-3 rounded-xl outline-none shadow-inner font-semibold text-slate-800 text-center" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 pb-8">
            <button type="submit" className="w-full bg-purple-600 text-white font-medium text-base py-4 rounded-full shadow-md shadow-purple-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <Zap size={18} className="text-purple-200" />
              {inputType === 'gpx' ? 'Upload & Analisis AI' : 'Simpan Aktivitas & Analisis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileAddActivity;