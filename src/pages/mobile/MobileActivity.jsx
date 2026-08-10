import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Clock, Route, ChevronRight, Flame, Activity, Trash2, Edit, X, CalendarDays, TrendingUp, Type, ChevronLeft, Calendar as CalendarIcon, Filter, ChevronRight as ChevronRightIcon } from 'lucide-react';

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

const parseTimeStr = (str) => {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
  if (parts.length === 2) return (parts[0] * 60) + (parts[1] || 0);
  return parseInt(str) || 0;
};

// --- KOMPONEN INPUT FORM MINIMALIS ---
const ModernInput = ({ icon: Icon, label, type, value, onChange, placeholder, step }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="bg-slate-900 rounded-[1.5rem] flex items-center gap-3 px-4 border border-slate-800 focus-within:border-[#ccff00] focus-within:ring-[1px] focus-within:ring-[#ccff00] transition-all shadow-sm">
      {Icon && <Icon size={18} className="text-[#ccff00] shrink-0" />}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        className="w-full bg-transparent py-4 outline-none font-bold text-sm text-white placeholder-slate-600" 
        placeholder={placeholder}
        step={step}
        required 
      />
    </div>
  </div>
);

// --- KOMPONEN KARTU GESER (SWIPEABLE CARD) DESAIN CLEAN & MINIMALIS ---
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

    if (Math.abs(diffX) > Math.abs(diffY)) {
      isSwipingHorizontal.current = true;
      if (diffX < 0 && diffX >= -140) {
        setTranslateX(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (translateX < -60) {
      setTranslateX(-130);
      setIsSwiped(true);
    } else {
      setTranslateX(0);
      setIsSwiped(false);
    }
  };

  const handleClick = () => {
    if (isSwiped) {
      setTranslateX(0);
      setIsSwiped(false);
    } else {
      onClick(run.id);
    }
  };

  const runDate = new Date(run.date);
  const dateString = runDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const displayTitle = run.title || getDynamicTitle(run.date);

  return (
    <div className="relative overflow-hidden rounded-[2rem] mb-4 bg-slate-900 border border-slate-800 shadow-sm">
      
      {/* Area Tombol Aksi di Belakang */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-5 gap-3 w-[140px] bg-slate-950">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(run); setTranslateX(0); setIsSwiped(false); }} 
          className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-transform shadow-md"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(run.id); }} 
          className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-md"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Kartu Utama yang Digeser (Clean Solid Design) */}
      <div 
        className="flex flex-col relative z-10 transition-transform duration-200 ease-out rounded-[2rem] bg-slate-900 w-full"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="p-5 flex flex-col gap-5">
          {/* Header Kartu */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-slate-800 flex items-center justify-center text-[#ccff00]">
                <Map size={24} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-base tracking-tight mb-0.5">{displayTitle}</h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{dateString}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-600" />
          </div>

          {/* Grid Metrik (Lebih Rapi dan Proporsional) */}
          <div className="grid grid-cols-3 bg-slate-950 rounded-2xl py-3 border border-slate-800/50">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Jarak</span>
              <p className="text-sm font-black text-white">{(run.distance || 0).toFixed(2)} <span className="text-[10px] font-semibold text-slate-500">km</span></p>
            </div>
            
            <div className="flex flex-col items-center justify-center border-x border-slate-800">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pace</span>
              <p className="text-sm font-black text-[#ccff00]">{run.avgPace || "00:00"}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Waktu</span>
              <p className="text-sm font-black text-white">{Math.floor(run.movingTime / 60)} <span className="text-[10px] font-semibold text-slate-500">m</span></p>
            </div>
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
  
  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const workoutTypes = ['Semua', 'Pagi', 'Siang', 'Sore', 'Malam'];

  // Custom Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRun, setEditingRun] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', date: '', distance: '', movingTime: '', avgPace: '', elevation: '' 
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const sortedData = savedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(sortedData);
  };

  const handleDelete = (id) => {
    const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
    const filteredData = savedData.filter(run => run.id !== id);
    localStorage.setItem('savedRuns', JSON.stringify(filteredData));
    setActivities(filteredData);
  };

  const handleEditClick = (run) => {
    setEditingRun(run);
    const localDate = new Date(run.date);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(localDate - tzOffset)).toISOString().slice(0, 16);

    setEditForm({
      title: run.title || getDynamicTitle(run.date),
      date: localISOTime,
      distance: (run.distance || 0).toFixed(2),
      movingTime: formatTimeStr(run.movingTime),
      avgPace: run.avgPace || "00:00",
      elevation: run.elevation || 0
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editForm.title.trim() !== "") {
      const savedData = JSON.parse(localStorage.getItem('savedRuns') || '[]');
      const updatedData = savedData.map(item => {
        if (item.id === editingRun.id) {
          return { 
            ...item, 
            title: editForm.title.trim(),
            date: new Date(editForm.date).toISOString(),
            distance: parseFloat(editForm.distance),
            movingTime: parseTimeStr(editForm.movingTime),
            avgPace: editForm.avgPace,
            elevation: parseInt(editForm.elevation, 10)
          };
        }
        return item;
      });
      localStorage.setItem('savedRuns', JSON.stringify(updatedData));
      
      const sortedUpdated = updatedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(sortedUpdated);
      
      setIsEditModalOpen(false);
      setEditingRun(null);
    }
  };

  // --- LOGIKA KALENDER KUSTOM ---
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = filterDate === dateStr;
      const isToday = new Date().toISOString().slice(0,10) === dateStr;

      days.push(
        <button 
          key={i}
          onClick={() => {
            setFilterDate(dateStr);
            setIsCalendarOpen(false);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-black transition-all active:scale-90 ${
            isSelected 
              ? 'bg-[#ccff00] text-slate-900 shadow-[0_0_10px_rgba(204,255,0,0.5)]' 
              : isToday 
                ? 'border-2 border-[#ccff00] text-[#ccff00] bg-slate-900' 
                : 'text-slate-300 hover:bg-slate-800 active:bg-slate-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  // --- LOGIKA FILTER ---
  const filteredActivities = activities.filter(run => {
    let passDate = true;
    let passType = true;

    if (filterDate) {
      const runDate = new Date(run.date);
      const yyyy = runDate.getFullYear();
      const mm = String(runDate.getMonth() + 1).padStart(2, '0');
      const dd = String(runDate.getDate()).padStart(2, '0');
      passDate = `${yyyy}-${mm}-${dd}` === filterDate;
    }

    if (filterType !== 'Semua') {
      const title = run.title || getDynamicTitle(run.date);
      passType = title.toLowerCase().includes(filterType.toLowerCase());
    }

    return passDate && passType;
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-24 relative font-sans text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate('/mobile')} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-black text-white tracking-wide">Riwayat Aktivitas</h1>
        <button 
          onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
          className={`w-10 h-10 flex items-center justify-center -mr-2 rounded-full transition-colors relative ${filterDate || isCalendarOpen ? 'text-[#ccff00] bg-slate-900' : 'text-slate-400 active:bg-slate-800'}`}
        >
          {isCalendarOpen ? <X size={20} /> : <CalendarIcon size={20} />}
          {filterDate && !isCalendarOpen && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ccff00] rounded-full border-2 border-slate-950 shadow-[0_0_5px_rgba(204,255,0,0.8)]"></span>}
        </button>
      </div>

      {/* DROPDOWN KALENDER KUSTOM */}
      {isCalendarOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsCalendarOpen(false)}></div>
          <div className="fixed top-16 left-0 right-0 max-w-md mx-auto z-40 bg-slate-900 border-b border-slate-800 shadow-2xl shadow-black/60 rounded-b-[2rem] p-6 animate-in slide-in-from-top-4">
            
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 active:bg-slate-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-sm font-black text-white tracking-wide">
                {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 active:bg-slate-700 transition-colors">
                <ChevronRightIcon size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
              {renderCalendarDays()}
            </div>

            <div className="mt-8 pt-4 flex justify-center">
              <button 
                onClick={() => { setFilterDate(''); setIsCalendarOpen(false); }}
                className="text-xs font-black text-slate-950 bg-[#ccff00] px-6 py-3 rounded-full active:scale-95 transition-transform shadow-[0_0_10px_rgba(204,255,0,0.3)] w-full max-w-[200px]"
              >
                Hapus Filter
              </button>
            </div>
          </div>
        </>
      )}

      {/* FILTER JENIS LATIHAN (PILL BUTTONS) */}
      <div className="pt-20 pb-2 flex overflow-x-auto gap-2 px-5 hide-scrollbar">
        {workoutTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
              filterType === type 
                ? 'bg-[#ccff00] text-slate-900 shadow-[0_0_10px_rgba(204,255,0,0.3)] border border-[#ccff00]' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white active:scale-95'
            }`}
          >
            {type === 'Semua' ? type : `Lari ${type}`}
          </button>
        ))}
      </div>

      {/* INDIKATOR FILTER TANGGAL AKTIF */}
      {filterDate && (
        <div className="px-5 mb-4 mt-2">
          <div className="inline-flex items-center gap-3 bg-[#ccff00]/10 border border-[#ccff00]/30 pl-4 pr-1 py-1 rounded-[1rem]">
            <span className="text-xs font-bold text-white tracking-wide">
              {new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setFilterDate('')} className="text-slate-950 bg-[#ccff00] rounded-full p-1.5 shadow-sm active:scale-90 transition-transform">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* DAFTAR AKTIVITAS */}
      <div className="px-5 mt-4 space-y-1">
        {filteredActivities.length === 0 ? (
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center border border-slate-800 shadow-md flex flex-col items-center mt-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-5 border border-slate-700">
               <Filter size={24} className="text-slate-400" />
            </div>
            <p className="text-base font-black text-white mb-2 tracking-wide">Data Kosong</p>
            <p className="text-xs font-medium text-slate-400 leading-relaxed px-4">Kami tidak menemukan catatan lari dengan filter tersebut.</p>
            {(filterDate || filterType !== 'Semua') && (
              <button 
                onClick={() => { setFilterDate(''); setFilterType('Semua'); }}
                className="mt-6 text-xs font-black text-slate-900 bg-[#ccff00] px-6 py-3.5 rounded-full active:scale-95 transition-transform shadow-[0_0_10px_rgba(204,255,0,0.3)]"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((run) => (
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
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end justify-center sm:items-center">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white tracking-tight">Edit Aktivitas</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-transform"
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-5 overflow-y-auto hide-scrollbar pb-4">
              <ModernInput 
                icon={Type} label="Judul Lari" type="text" 
                value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                placeholder="Contoh: Lari Santai" 
              />
              
              <ModernInput 
                icon={CalendarDays} label="Tanggal & Waktu" type="datetime-local" 
                value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} 
              />

              <div className="grid grid-cols-2 gap-4">
                <ModernInput 
                  icon={Route} label="Jarak (km)" type="number" step="0.01"
                  value={editForm.distance} onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })} 
                />
                <ModernInput 
                  icon={Clock} label="Waktu (HH:MM:SS)" type="text" 
                  value={editForm.movingTime} onChange={(e) => setEditForm({ ...editForm, movingTime: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModernInput 
                  icon={Flame} label="Pace (MM:SS)" type="text" 
                  value={editForm.avgPace} onChange={(e) => setEditForm({ ...editForm, avgPace: e.target.value })} 
                />
                <ModernInput 
                  icon={TrendingUp} label="Elevasi (m)" type="number" 
                  value={editForm.elevation} onChange={(e) => setEditForm({ ...editForm, elevation: e.target.value })} 
                />
              </div>

              <button 
                type="submit" 
                className="w-full text-slate-950 font-black tracking-wide text-base py-4 rounded-[1.5rem] shadow-[0_0_20px_rgba(204,255,0,0.3)] mt-2 transition-transform bg-[#ccff00] active:scale-[0.98]"
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