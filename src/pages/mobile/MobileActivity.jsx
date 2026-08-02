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
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="bg-slate-50 rounded-2xl flex items-center gap-3 px-4 border border-slate-100 focus-within:border-purple-400 focus-within:ring-[3px] focus-within:ring-purple-50 transition-all">
      {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        className="w-full bg-transparent py-3.5 outline-none font-medium text-sm text-slate-800" 
        placeholder={placeholder}
        step={step}
        required 
      />
    </div>
  </div>
);

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
    <div className="relative overflow-hidden rounded-3xl mb-4 bg-slate-100 shadow-sm border border-slate-50">
      
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

      <div 
        className="bg-white rounded-3xl p-4 flex flex-col gap-4 relative z-10 transition-transform duration-200 ease-out border border-slate-100/50"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/50">
              <Map size={20} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">{displayTitle}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">{dateString}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 shrink-0" />
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center px-6 border border-slate-100/50">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Jarak</span>
            <p className="text-sm font-black text-slate-800">{(run.distance || 0).toFixed(2)} <span className="text-[10px] font-medium text-slate-500">km</span></p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pace</span>
            <p className="text-sm font-black text-slate-800">{run.avgPace || "00:00"}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Waktu</span>
            <p className="text-sm font-black text-slate-800">{Math.floor(run.movingTime / 60)} <span className="text-[10px] font-medium text-slate-500">m</span></p>
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
    return day === 0 ? 6 : day - 1; // Senin = 0, Minggu = 6
  };

  const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Kotak kosong sebelum tanggal 1
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    
    // Tanggal aktual
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
          className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-semibold transition-all active:scale-90 ${
            isSelected 
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
              : isToday 
                ? 'border border-purple-300 text-purple-600 bg-purple-50' 
                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
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
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate('/mobile')} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold text-slate-800">Riwayat Aktivitas</h1>
        <button 
          onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
          className={`w-10 h-10 flex items-center justify-center -mr-2 rounded-full transition-colors relative ${filterDate || isCalendarOpen ? 'text-purple-600 bg-purple-50' : 'text-slate-500 active:bg-slate-200'}`}
        >
          {isCalendarOpen ? <X size={20} /> : <CalendarIcon size={20} />}
          {filterDate && !isCalendarOpen && <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white"></span>}
        </button>
      </div>

      {/* DROPDOWN KALENDER KUSTOM */}
      {isCalendarOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsCalendarOpen(false)}></div>
          <div className="fixed top-16 left-0 right-0 max-w-md mx-auto z-40 bg-white border-b border-slate-100 shadow-xl shadow-slate-200/40 rounded-b-3xl p-6 animate-in slide-in-from-top-4">
            
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 active:bg-slate-200">
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-sm font-bold text-slate-800">
                {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 active:bg-slate-200">
                <ChevronRightIcon size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 justify-items-center">
              {renderCalendarDays()}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <button 
                onClick={() => { setFilterDate(''); setIsCalendarOpen(false); }}
                className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full active:bg-slate-200"
              >
                Hapus Filter Tanggal
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
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filterType === type 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                : 'bg-white text-slate-500 border border-slate-100 active:bg-slate-50'
            }`}
          >
            {type === 'Semua' ? type : `Lari ${type}`}
          </button>
        ))}
      </div>

      {/* INDIKATOR FILTER TANGGAL AKTIF */}
      {filterDate && (
        <div className="px-5 mb-4 mt-2">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl">
            <span className="text-xs font-medium text-purple-700">Tampilkan: <span className="font-bold">{new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
            <button onClick={() => setFilterDate('')} className="text-purple-400 hover:text-purple-600 bg-white rounded-full p-0.5 shadow-sm">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* DAFTAR AKTIVITAS */}
      <div className="px-5 mt-4 space-y-1">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm flex flex-col items-center mt-6">
            <Filter size={40} className="text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-600 mb-1">Aktivitas Tidak Ditemukan</p>
            <p className="text-xs font-medium text-slate-400">Coba ubah tanggal atau jenis filter di atas.</p>
            {(filterDate || filterType !== 'Semua') && (
              <button 
                onClick={() => { setFilterDate(''); setFilterType('Semua'); }}
                className="mt-6 text-xs font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-full"
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
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Aktivitas</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
              >
                <X size={18}/>
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
                className="w-full text-white font-semibold text-base py-4 rounded-2xl shadow-lg shadow-purple-200 mt-2 transition-colors bg-purple-600 active:scale-[0.98]"
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