import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, UploadCloud, Map, Clock, CheckCircle, Zap, Calendar, TrendingUp, Activity } from 'lucide-react';

const MobileAddActivity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recordedDistance, recordedDuration, recordedPositions } = location.state || {};

  const [inputType, setInputType] = useState('manual'); 
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', elevation: '', gpxFile: null });

  // State untuk form manual yang dipecah
  const [distanceKm, setDistanceKm] = useState('');
  const [distanceM, setDistanceM] = useState('');
  const [timeH, setTimeH] = useState('');
  const [timeM, setTimeM] = useState('');
  const [timeS, setTimeS] = useState('');
  const [paceM, setPaceM] = useState('');
  const [paceS, setPaceS] = useState('');

  // Efek untuk mengisi form secara otomatis jika ada data rekaman lari
  useEffect(() => {
    if (recordedDistance !== undefined && recordedDuration !== undefined) {
      // Set tipe input ke manual
      setInputType('manual');

      // Kalkulasi Jarak
      const dKm = Math.floor(recordedDistance);
      const dM = Math.round((recordedDistance - dKm) * 100);
      setDistanceKm(dKm);
      setDistanceM(dM < 10 ? `0${dM}` : dM);

      // Kalkulasi Waktu (Durasi)
      const h = Math.floor(recordedDuration / 3600);
      const m = Math.floor((recordedDuration % 3600) / 60);
      const s = recordedDuration % 60;
      setTimeH(h > 0 ? h : '');
      setTimeM(m < 10 ? `0${m}` : m);
      setTimeS(s < 10 ? `0${s}` : s);

      // Kalkulasi Pace
      if (recordedDistance > 0) {
        const minutesPerKm = (recordedDuration / 60) / recordedDistance;
        const pm = Math.floor(minutesPerKm);
        const ps = Math.floor((minutesPerKm - pm) * 60);
        setPaceM(pm < 10 ? `0${pm}` : pm);
        setPaceS(ps < 10 ? `0${ps}` : ps);
      }

      // Set Waktu ke waktu saat ini di zona waktu lokal
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({ ...prev, date: now.toISOString().slice(0, 16) }));
    }
  }, [recordedDistance, recordedDuration]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    
    // Disini kamu bisa menyatukan data state (distanceKm, timeH, dsb) 
    // menjadi payload yang dikirim ke Backend Laravel menggunakan Axios.
    console.log("Rute Koordinat (Siap dikirim ke backend):", recordedPositions);
    
    alert('Aktivitas berhasil disimpan!'); 
    navigate('/mobile'); 
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-semibold text-slate-800">Simpan Aktivitas</h1>
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
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Map size={14}/> Jarak Total</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={distanceKm} onChange={(e)=>setDistanceKm(e.target.value)} placeholder="0" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xl font-bold text-slate-300">,</span>
                  <input type="number" value={distanceM} onChange={(e)=>setDistanceM(e.target.value)} placeholder="00" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">Kilometer (km)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Clock size={14}/> Total Waktu Bergerak</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={timeH} onChange={(e)=>setTimeH(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" value={timeM} onChange={(e)=>setTimeM(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" value={timeS} onChange={(e)=>setTimeS(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">(J : M : D)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Activity size={14}/> Pace</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={paceM} onChange={(e)=>setPaceM(e.target.value)} placeholder="00" className="w-12 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                    <span className="font-bold text-slate-300">:</span>
                    <input type="number" value={paceS} onChange={(e)=>setPaceS(e.target.value)} placeholder="00" className="w-12 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
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
              Simpan Aktivitas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileAddActivity;