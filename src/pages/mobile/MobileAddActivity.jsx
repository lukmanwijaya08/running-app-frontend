import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, UploadCloud, Map, Clock, CheckCircle, Zap, Calendar, TrendingUp, Activity, AlertCircle } from 'lucide-react';

// Fungsi Helper Kalkulasi Jarak Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
};

// Fungsi Helper Format Pace
const formatPace = (distance, durationSec) => {
  if (!distance || !durationSec || distance <= 0) return "00:00";
  const minutesPerKm = (durationSec / 60) / distance;
  const m = Math.floor(minutesPerKm);
  const s = Math.floor((minutesPerKm - m) * 60);
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

const MobileAddActivity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recordedDistance, recordedDuration, recordedPositions } = location.state || {};

  const [inputType, setInputType] = useState('manual'); 
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    elevation: '', 
    gpxFile: null 
  });

  // State untuk form manual yang dipecah
  const [distanceKm, setDistanceKm] = useState('');
  const [distanceM, setDistanceM] = useState('');
  const [timeH, setTimeH] = useState('');
  const [timeM, setTimeM] = useState('');
  const [timeS, setTimeS] = useState('');

  // Efek untuk mengisi form secara otomatis jika ada data dari MobileRecordRun
  useEffect(() => {
    if (recordedDistance !== undefined && recordedDuration !== undefined) {
      setInputType('manual');

      const dKm = Math.floor(recordedDistance);
      const dM = Math.round((recordedDistance - dKm) * 100);
      setDistanceKm(dKm);
      setDistanceM(dM < 10 ? `0${dM}` : dM);

      const h = Math.floor(recordedDuration / 3600);
      const m = Math.floor((recordedDuration % 3600) / 60);
      const s = Math.floor(recordedDuration % 60);
      setTimeH(h > 0 ? h : '');
      setTimeM(m < 10 ? `0${m}` : m);
      setTimeS(s < 10 ? `0${s}` : s);

      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({ ...prev, date: now.toISOString().slice(0, 16) }));
    } else {
      // Set default date to now untuk input manual baru
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData(prev => ({ ...prev, date: now.toISOString().slice(0, 16) }));
    }
  }, [recordedDistance, recordedDuration]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // FUNGSI UTAMA: MENYIMPAN KE LOCALSTORAGE (Database Sementara)
  const saveToHistory = (runData) => {
    const existingRuns = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    localStorage.setItem('savedRuns', JSON.stringify([runData, ...existingRuns]));
    navigate(`/mobile/activity/${runData.id}`);
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage("Judul aktivitas tidak boleh kosong.");
      return;
    }

    const runId = Date.now().toString();

    // 1. JIKA USER MENGGUNAKAN INPUT MANUAL
    if (inputType === 'manual') {
      const distStr = `${distanceKm || 0}.${distanceM || 0}`;
      const totalDistance = parseFloat(distStr);
      const totalDuration = (parseInt(timeH || 0) * 3600) + (parseInt(timeM || 0) * 60) + parseInt(timeS || 0);

      if (totalDistance <= 0 || totalDuration <= 0) {
        setErrorMessage("Jarak dan waktu tidak valid.");
        return;
      }

      const newRunData = {
        id: runId,
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        distance: totalDistance,
        movingTime: totalDuration,
        avgPace: formatPace(totalDistance, totalDuration),
        calories: Math.round(totalDistance * 65),
        steps: Math.round(totalDistance * 1300),
        // Gunakan posisi rekaman GPS jika ada, jika tidak kosongkan
        positions: recordedPositions || [] 
      };

      saveToHistory(newRunData);
    } 
    
    // 2. JIKA USER UPLOAD FILE GPX
    else if (inputType === 'gpx') {
      if (!formData.gpxFile) {
        setErrorMessage("Silakan pilih file GPX terlebih dahulu.");
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const gpxContent = event.target.result;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(gpxContent, "text/xml");
          
          const trkpts = xmlDoc.getElementsByTagName("trkpt");
          if (trkpts.length === 0) throw new Error("Tidak ada data jalur terekam dalam file GPX ini.");

          let parsedPositions = [];
          let totalGpxDistance = 0;
          let firstTime = null;
          let lastTime = null;

          for (let i = 0; i < trkpts.length; i++) {
            const pt = trkpts[i];
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));
            
            const eleNode = pt.getElementsByTagName("ele")[0];
            const timeNode = pt.getElementsByTagName("time")[0];
            
            const alt = eleNode ? parseFloat(eleNode.textContent) : 0;
            const ptTime = timeNode ? new Date(timeNode.textContent).getTime() : Date.now();

            if (i === 0) firstTime = ptTime;
            lastTime = ptTime;

            parsedPositions.push({ lat, lon, alt, time: ptTime });

            if (i > 0) {
              totalGpxDistance += calculateDistance(parsedPositions[i-1].lat, parsedPositions[i-1].lon, lat, lon);
            }
          }

          const totalGpxDuration = Math.max(0, (lastTime - firstTime) / 1000); // dalam detik

          const newRunData = {
            id: runId,
            title: formData.title,
            description: formData.description,
            date: new Date(firstTime).toISOString(),
            distance: totalGpxDistance,
            movingTime: totalGpxDuration,
            avgPace: formatPace(totalGpxDistance, totalGpxDuration),
            calories: Math.round(totalGpxDistance * 65),
            steps: Math.round(totalGpxDistance * 1300),
            positions: parsedPositions 
          };

          saveToHistory(newRunData);
        } catch (error) {
          console.error(error);
          setErrorMessage("Gagal memproses file GPX. Pastikan format file benar.");
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage("Gagal membaca file dari memori perangkat.");
        setIsProcessing(false);
      };

      reader.readAsText(formData.gpxFile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10 relative">
      
      {/* Pesan Error Floating */}
      {errorMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-50 px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-semibold text-slate-800">Simpan Aktivitas</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-24 px-5 max-w-md mx-auto">
        
        {/* TAB PILIHAN INPUT */}
        <div className="bg-slate-200/60 p-1 rounded-full flex mb-8">
          <button type="button" onClick={() => setInputType('manual')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${inputType === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
            Input Manual
          </button>
          <button type="button" onClick={() => setInputType('gpx')} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${inputType === 'gpx' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
            Upload GPX
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* JUDUL DAN DESKRIPSI UTAMA */}
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

          {/* AREA UPLOAD GPX */}
          {inputType === 'gpx' && (
            <div onClick={() => fileInputRef.current.click()} className="w-full bg-white border border-dashed border-slate-300 hover:border-purple-300 rounded-3xl p-10 cursor-pointer transition-colors flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <input type="file" ref={fileInputRef} onChange={(e) => {
                setErrorMessage('');
                setFormData({...formData, gpxFile: e.target.files[0]});
              }} accept=".gpx,.xml" className="hidden" />
              
              {formData.gpxFile ? (
                <>
                  <CheckCircle size={40} className="text-green-500 mb-3" />
                  <p className="font-medium text-slate-800 text-sm break-all px-4">{formData.gpxFile.name}</p>
                  <p className="text-xs text-slate-400 mt-2">Ubah File</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4"><UploadCloud size={24} className="text-purple-600" /></div>
                  <p className="font-medium text-slate-800">Ketuk untuk pilih file GPX</p>
                  <p className="text-xs text-slate-400 mt-1">Hanya format .gpx / .xml</p>
                </>
              )}
            </div>
          )}

          {/* AREA INPUT MANUAL */}
          {inputType === 'manual' && (
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Calendar size={14}/> Tanggal & Waktu Mulai</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl outline-none font-medium text-sm text-slate-800 shadow-inner" required={inputType === 'manual'} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Map size={14}/> Jarak Total</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={distanceKm} onChange={(e)=>setDistanceKm(e.target.value)} placeholder="0" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xl font-bold text-slate-300">,</span>
                  <input type="number" min="0" max="99" value={distanceM} onChange={(e)=>setDistanceM(e.target.value)} placeholder="00" className="w-16 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">Kilometer (km)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-1.5"><Clock size={14}/> Total Waktu Bergerak</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={timeH} onChange={(e)=>setTimeH(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" min="0" max="59" value={timeM} onChange={(e)=>setTimeM(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="font-bold text-slate-300">:</span>
                  <input type="number" min="0" max="59" value={timeS} onChange={(e)=>setTimeS(e.target.value)} placeholder="00" className="w-14 p-3 bg-slate-50 shadow-inner rounded-xl text-center font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-100" />
                  <span className="text-xs font-medium text-slate-400 ml-1">(J : M : D)</span>
                </div>
              </div>

              {/* Pace Otomatis Dihitung & Info Tambahan */}
              <div className="bg-purple-50 rounded-2xl p-4 flex items-center justify-between border border-purple-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600"><Activity size={18}/></div>
                  <div>
                    <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest">Pace Rata-rata</p>
                    <p className="text-lg font-bold text-purple-700">{formatPace(parseFloat(`${distanceKm || 0}.${distanceM || 0}`), (parseInt(timeH || 0) * 3600) + (parseInt(timeM || 0) * 60) + parseInt(timeS || 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 pb-8">
            <button type="submit" disabled={isProcessing} className={`w-full text-white font-medium text-base py-4 rounded-full shadow-md transition-transform flex items-center justify-center gap-2 ${isProcessing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 shadow-purple-200 active:scale-[0.98]'}`}>
              {isProcessing ? (
                <span className="animate-pulse">Memproses Data...</span>
              ) : (
                <><Zap size={18} className="text-purple-200" /> Simpan Aktivitas</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileAddActivity;