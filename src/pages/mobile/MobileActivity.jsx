import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Flame, Activity, Trash2, Edit, X } from 'lucide-react';

// --- HELPER FUNCTIONS ---
const getDynamicTitle = (timestamp) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 4 && hour < 10) return 'Lari Pagi';
  if (hour >= 10 && hour < 15) return 'Lari Siang';
  if (hour >= 15 && hour < 18) return 'Lari Sore';
  return 'Lari Malam';
};

const formatTimeStr = (totalSeconds) => {
  if (!totalSeconds) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
};

// --- KOMPONEN KARTU GESER (SWIPEABLE CARD) ---
const SwipeableActivityCard = ({ run, onClick, onDelete, onEdit }) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwipingHorizontal = useRef(false);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isSwipingHorizontal.current = false;
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // Deteksi jika pengguna menggeser ke samping (bukan scroll ke bawah)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      isSwipingHorizontal.current = true;
      // Batasi geseran ke kiri maksimal -140px
      if (diffX < 0 && diffX >= -140) {
        setTranslateX(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (translateX < -60) {
      // Jika digeser cukup jauh, buka menu aksi (snap open)
      setTranslateX(-130);
      setIsSwiped(true);
    } else {
      // Jika tidak cukup jauh, kembalikan ke posisi semula (snap closed)
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  const handleClick = () => {
    if (isSwiped) {
      // Jika card sedang terbuka, klik untuk menutup
      setTranslateX(0);
      setIsSwiped(false);
    } else {
      // Jika card tertutup, navigasi ke detail
      onClick(run.id);
    }
  };

  const runDate = new Date(run.date);
  const dateString = runDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const displayTitle = run.title || getDynamicTitle(run.date);

  return (
    <div className="relative overflow-hidden rounded-3xl mb-4 bg-slate-100 shadow-sm border border-slate-50">
      
      {/* TOMBOL AKSI (Tersembunyi di belakang kartu) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-4 gap-3 w-[140px]">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(run); setTranslateX(0); setIsSwiped(false); }} 
          className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-md shadow-amber-200"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(run.id); }} 
          className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-md shadow-rose-200"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* KARTU UTAMA (Yang bisa digeser) */}
      <div 
        className="bg-white rounded-3xl p-4 flex flex-col gap-4 relative z-10 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
              <Map size={20} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">{displayTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{dateString}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 shrink-0" />
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center px-4">
          <div className="flex items-center gap-1.5">
            <Route size={14} className="text-slate-400"/>
            <p className="text-xs font-semibold text-slate-700">{(run.distance || 0).toFixed(2)} km</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-slate-400"/>
            <p className="text-xs font-semibold text-slate-700">{run.avgPace || "00:00"}</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400"/>
            <p className="text-xs font-semibold text-slate-700">{formatTimeStr(run.movingTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN HALAMAN UTAMA ---
const MobileActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  
  // State untuk kontrol Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRun, setEditingRun] = useState(null);
  const [editForm, setEditForm] = useState({ title: '' });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const sortedData = savedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sortedData);
  };

  // Fungsi Hapus Langsung Tanpa Konfirmasi
  const handleDelete = (id) => {
    const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const filteredData = savedData.filter(run => run.id !== id);
    localStorage.setItem('savedRuns', JSON.stringify(filteredData));
    setActivities(filteredData);
  };

  // Membuka Modal Edit dan Mengisi Form
  const handleEditClick = (run) => {
    const currentTitle = run.title || getDynamicTitle(run.date);
    setEditingRun(run);
    setEditForm({ title: currentTitle });
    setIsEditModalOpen(true);
  };

  // Menyimpan Perubahan Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editForm.title.trim() !== "") {
      const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
      const updatedData = savedData.map(item => {
        if (item.id === editingRun.id) {
          return { ...item, title: editForm.title.trim() };
        }
        return item;
      });
      localStorage.setItem('savedRuns', JSON.stringify(updatedData));
      setActivities(updatedData);
      setIsEditModalOpen(false);
      setEditingRun(null);
    }
  };

  return (
    <div className="pt-8 px-5 pb-6">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shadow-sm">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Semua Aktivitas</h1>
          <p className="text-xs font-medium text-slate-400">Riwayat lari yang tersimpan</p>
        </div>
      </div>

      {/* Daftar Aktivitas */}
      <div className="space-y-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-50 shadow-sm">
            <Map size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-600">Belum ada aktivitas lari</p>
            <p className="text-xs mt-1">Mulai rekam lari pertamamu sekarang!</p>
          </div>
        ) : (
          activities.map((run) => (
            <SwipeableActivityCard 
              key={run.id} 
              run={run} 
              onClick={(id) => navigate(`/mobile/activity/${id}`)}
              onDelete={handleDelete}
              onEdit={handleEditClick}
            />
          ))
        )}
      </div>

      {/* MODAL POP-UP EDIT AKTIVITAS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Edit Aktivitas</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
              >
                <X size={18}/>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Nama Aktivitas</label>
                <div className="bg-slate-50 rounded-xl flex items-center gap-3 px-3 border border-slate-100 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                    className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" 
                    placeholder="Contoh: Lari Pagi Santai"
                    required 
                    autoFocus
                  />
                </div>
              </div>

              {/* Data Pendukung Tambahan (Read-only) */}
              {editingRun && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 mt-2">
                  <div className="flex items-center gap-1.5"><Route size={14}/> {(editingRun.distance || 0).toFixed(2)} km</div>
                  <div className="flex items-center gap-1.5"><Flame size={14}/> {editingRun.avgPace || "00:00"}</div>
                  <div className="flex items-center gap-1.5"><Clock size={14}/> {formatTimeStr(editingRun.movingTime)}</div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full text-white font-medium text-base py-4 rounded-full shadow-md mt-4 transition-colors bg-purple-600 active:scale-[0.98]"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileActivity;