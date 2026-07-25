import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, ChevronRight, Route, Flame, Clock, Calendar, Edit2, Trash2, X } from 'lucide-react';

const MobileActivity = () => {
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState('');
  
  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, title: '', distance: '', time: '' });

  // Data Dummy Aktivitas
  const [activities, setActivities] = useState([
    { id: 1, title: 'Morning Run Semarang', description: 'Lari santai', distance: '5.2 km', pace: '06:15', time: '32:30', date: '2026-07-24', displayDate: '24 Jul', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 2, title: 'Night Speed Workout', description: 'Interval training', distance: '8.0 km', pace: '05:30', time: '44:00', date: '2026-07-23', displayDate: '23 Jul', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: 3, title: 'Sunday Long Run', description: 'Endurance', distance: '15.5 km', pace: '06:45', time: '01:45:00', date: '2026-07-20', displayDate: '20 Jul', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]);

  // Fungsi Filter
  const displayedActivities = filterDate 
    ? activities.filter(a => a.date === filterDate)
    : activities;

  // Fungsi Hapus dengan Alert
  const handleDelete = (id, title) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus aktivitas "${title}"? Data tidak dapat dikembalikan.`)) {
      setActivities(activities.filter(a => a.id !== id));
      alert('Data berhasil dihapus.');
    }
  };

  // Fungsi Buka Modal Edit
  const openEditModal = (activity) => {
    setEditData({ id: activity.id, title: activity.title, distance: activity.distance.replace(' km',''), time: activity.time });
    setIsEditModalOpen(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setActivities(activities.map(a => a.id === editData.id ? { ...a, title: editData.title, distance: `${editData.distance} km`, time: editData.time } : a));
    setIsEditModalOpen(false);
    alert('Data berhasil diperbarui!');
  };

  return (
    <div className="pt-8 px-5 pb-10">
      <div className="flex items-center justify-between mb-8 relative">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Aktivitas Saya</h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            {filterDate ? `Menampilkan data: ${filterDate}` : 'Geser kiri untuk aksi'}
          </p>
        </div>
        
        {/* Tombol Kalender dengan Native Date Picker */}
        <div className="relative w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center text-purple-600 border border-slate-50 overflow-hidden">
          <Calendar size={20} />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        
        {/* Tombol Reset Filter (muncul jika ada filter aktif) */}
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="absolute -bottom-5 right-1 text-[10px] font-semibold text-red-500">Reset Filter</button>
        )}
      </div>

      <div className="space-y-4">
        {displayedActivities.length === 0 ? (
          <p className="text-center text-slate-400 text-sm mt-10">Tidak ada aktivitas pada tanggal ini.</p>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="overflow-x-auto snap-x snap-mandatory hide-scrollbar flex w-full rounded-3xl">
              
              <div onClick={() => navigate(`/mobile/activity/${activity.id}`)} className="snap-center shrink-0 w-full bg-white p-4 shadow-sm border border-slate-50 flex flex-col gap-4 cursor-pointer active:scale-[0.99] transition-transform rounded-3xl">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl ${activity.bgColor} flex items-center justify-center`}><Map size={20} className={activity.color} /></div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800">{activity.title}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{activity.displayDate} • {activity.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-1.5"><Route size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.distance}</p></div>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-1.5"><Flame size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.pace}</p></div>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/><p className="text-xs font-semibold text-slate-700">{activity.time}</p></div>
                </div>
              </div>
              
              <div className="snap-center shrink-0 w-32 flex items-center justify-center gap-3 pl-3 pr-1">
                <button onClick={() => openEditModal(activity)} className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-sm active:scale-90 transition-transform"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(activity.id, activity.title)} className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-sm active:scale-90 transition-transform"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL POP UP EDIT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl transform transition-transform animate-in slide-in-from-bottom-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Edit Aktivitas</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><X size={18}/></button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-1">Judul Aktivitas</label>
                <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl outline-none font-medium text-slate-800 shadow-inner" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1">Jarak (km)</label>
                  <input type="number" step="0.1" value={editData.distance} onChange={(e) => setEditData({...editData, distance: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl outline-none font-medium text-slate-800 shadow-inner" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 ml-1">Waktu</label>
                  <input type="text" value={editData.time} onChange={(e) => setEditData({...editData, time: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl outline-none font-medium text-slate-800 shadow-inner" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white font-medium text-base py-4 rounded-full shadow-md mt-4">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileActivity;