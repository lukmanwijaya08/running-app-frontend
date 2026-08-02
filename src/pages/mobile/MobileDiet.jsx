import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Scale, Flame, Target, Utensils, Plus, TrendingDown, Activity, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MobileDiet = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [profile, setProfile] = useState({
    name: 'Pelari',
    height: 170,
    weight: 70,
    gender: 'L',
    age: 25, 
    activityLevel: 1.375 
  });

  const [foodLog, setFoodLog] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  
  // Input States
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCal, setNewFoodCal] = useState('');
  const [newWeight, setNewWeight] = useState('');

  // --- LOAD DATA ---
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      setProfile(prev => ({
        ...prev,
        name: savedProfile.name || prev.name,
        height: parseFloat(savedProfile.height) || prev.height,
        weight: parseFloat(savedProfile.weight) || prev.weight,
        gender: savedProfile.gender || prev.gender,
        age: parseInt(savedProfile.age) || prev.age,
        activityLevel: parseFloat(savedProfile.activityLevel) || prev.activityLevel
      }));
    }

    const savedFood = JSON.parse(localStorage.getItem('foodLog') || '[]');
    const savedWeight = JSON.parse(localStorage.getItem('weightHistory') || '[]');
    
    if (savedWeight.length === 0 && savedProfile?.weight) {
       const initialHistory = [{ date: new Date().toISOString(), weight: parseFloat(savedProfile.weight) }];
       setWeightHistory(initialHistory);
       localStorage.setItem('weightHistory', JSON.stringify(initialHistory));
    } else {
       setWeightHistory(savedWeight);
    }

    const todayStr = new Date().toDateString();
    const todaysFood = savedFood.filter(food => new Date(food.time).toDateString() === todayStr);
    setFoodLog(todaysFood);
  }, []);

  // --- CALCULATIONS ---
  const calcIdealWeight = (h, g) => {
    if (!h) return 0;
    const base = h - 100;
    return g === 'P' ? base - (base * 0.15) : base - (base * 0.1);
  };
  const idealWeight = calcIdealWeight(profile.height, profile.gender);

  const heightInMeter = profile.height / 100;
  const bmi = profile.weight / (heightInMeter * heightInMeter);
  let bmiStatus = "Normal";
  if (bmi < 18.5) bmiStatus = "Underweight";
  else if (bmi >= 25 && bmi < 29.9) bmiStatus = "Overweight";
  else if (bmi >= 30) bmiStatus = "Obesitas";

  const calcBMR = (w, h, a, g) => {
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    return g === 'L' ? bmr + 5 : bmr - 161;
  };
  const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.gender);

  const tdee = Math.round(bmr * profile.activityLevel);

  let targetCalories = tdee;
  let dietGoal = "Maintain Weight";
  if (profile.weight > idealWeight + 2) {
    targetCalories -= 500; 
    dietGoal = "Fat Loss";
  } else if (profile.weight < idealWeight - 2) {
    targetCalories += 300; 
    dietGoal = "Muscle Gain";
  }

  const consumedCalories = foodLog.reduce((total, food) => total + food.calories, 0);
  const remainingCalories = Math.max(targetCalories - consumedCalories, 0);
  const progressPercent = Math.min((consumedCalories / targetCalories) * 100, 100);

  // --- HANDLERS ---
  const handleAddFood = (e) => {
    e.preventDefault();
    if (!newFoodName || !newFoodCal) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newFoodName,
      calories: parseInt(newFoodCal),
      time: new Date().toISOString()
    };

    const updatedLog = [newEntry, ...foodLog];
    setFoodLog(updatedLog);
    
    const allSavedFood = JSON.parse(localStorage.getItem('foodLog') || '[]');
    localStorage.setItem('foodLog', JSON.stringify([newEntry, ...allSavedFood]));

    setNewFoodName('');
    setNewFoodCal('');
  };

  const handleDeleteFood = (id) => {
    const updatedLog = foodLog.filter(f => f.id !== id);
    setFoodLog(updatedLog);

    const allSavedFood = JSON.parse(localStorage.getItem('foodLog') || '[]');
    const newAllFood = allSavedFood.filter(f => f.id !== id);
    localStorage.setItem('foodLog', JSON.stringify(newAllFood));
  };

  const handleUpdateWeight = (e) => {
    e.preventDefault();
    if (!newWeight) return;

    const weightVal = parseFloat(newWeight);
    
    const updatedProfile = { ...profile, weight: weightVal };
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    const newEntry = { date: new Date().toISOString(), weight: weightVal };
    let updatedHistory = [...weightHistory];
    const todayStr = new Date().toDateString();
    const todayIndex = updatedHistory.findIndex(w => new Date(w.date).toDateString() === todayStr);
    
    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = newEntry;
    } else {
      updatedHistory.push(newEntry);
    }
    
    updatedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setWeightHistory(updatedHistory);
    localStorage.setItem('weightHistory', JSON.stringify(updatedHistory));
    setNewWeight('');
  };

  const chartData = weightHistory.map(w => ({
    dateStr: new Date(w.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    weight: w.weight
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER */}
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-50/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-700 active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-semibold tracking-tight">Diet & Berat Badan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 px-5 space-y-6">
        
        {/* 1. KARTU TARGET KALORI HARIAN */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="flex w-full justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Target size={18} className="text-purple-600"/> Target Harian</h2>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">{dietGoal}</span>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center mb-6 mt-2">
            <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-sm">
              <circle cx="88" cy="88" r="76" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              <circle 
                cx="88" cy="88" r="76" 
                stroke="#9333ea" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 76} 
                strokeDashoffset={(2 * Math.PI * 76) - (progressPercent / 100) * (2 * Math.PI * 76)} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <Flame size={24} className="text-orange-400 mb-1" />
              <span className="text-4xl font-bold text-slate-800 tracking-tighter">{remainingCalories}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Kcal Tersisa</span>
            </div>
          </div>

          <div className="flex justify-between w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Target</p>
              <p className="font-bold text-slate-800 text-base">{targetCalories}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 my-auto"></div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Dikonsumsi</p>
              <p className="font-bold text-purple-600 text-base">{consumedCalories}</p>
            </div>
          </div>
        </div>

        {/* 2. KALKULATOR TDEE & BMR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <Activity size={18} className="text-orange-500" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">BMR (Basal)</p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{Math.round(bmr)} <span className="text-[10px] font-medium text-slate-500 tracking-normal">kcal/hr</span></h3>
          </div>
          <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <Flame size={18} className="text-purple-600" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">TDEE (Total)</p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{tdee} <span className="text-[10px] font-medium text-slate-500 tracking-normal">kcal/hr</span></h3>
          </div>
        </div>

        {/* 3. PROGRESS BERAT BADAN & GRAFIK */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Scale size={18} className="text-blue-500"/> Berat Badan</h2>
            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest border ${bmiStatus === 'Normal' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
              BMI: {bmi.toFixed(1)} ({bmiStatus})
            </div>
          </div>

          <div className="flex justify-between items-end mb-6 px-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Saat Ini</p>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">{profile.weight} <span className="text-sm font-medium text-slate-400 tracking-normal">kg</span></h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Ideal (Target)</p>
              <h3 className="text-lg font-bold text-slate-400">{idealWeight.toFixed(1)} <span className="text-xs font-medium text-slate-400">kg</span></h3>
            </div>
          </div>

          {/* Form Update Berat - UI Floating Button Anti Offside */}
          <form onSubmit={handleUpdateWeight} className="mb-8 relative">
            <div className="relative w-full">
              <input 
                type="number" 
                step="0.1" 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value)} 
                placeholder="Update berat (kg)" 
                className="w-full bg-slate-50 border border-slate-100 pl-5 pr-28 py-3.5 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-slate-800 text-white px-5 rounded-xl text-xs font-semibold active:scale-95 transition-transform shadow-sm">
                Simpan
              </button>
            </div>
          </form>

          {/* Grafik Recharts */}
          <div className="h-40 w-full min-w-[10px] min-h-[10px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins' }} />
                  <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: '600', fontSize: '12px', fontFamily: 'Poppins' }} formatter={(value) => [`${value} kg`, 'Berat']} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-medium text-slate-400">Data belum cukup</div>
            )}
          </div>
        </div>

        {/* 4. LOG MAKANAN HARIAN */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-6"><Utensils size={18} className="text-orange-500"/> Konsumsi Hari Ini</h2>
          
          {/* Form Tambah Makanan - Ditumpuk (Stacked) Anti Offside */}
          <form onSubmit={handleAddFood} className="flex flex-col gap-3 mb-8">
            <input 
              type="text" 
              value={newFoodName} 
              onChange={(e) => setNewFoodName(e.target.value)} 
              placeholder="Nama Makanan (Cth: Nasi Goreng)" 
              className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
            />
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={newFoodCal} 
                  onChange={(e) => setNewFoodCal(e.target.value)} 
                  placeholder="Jumlah Kalori" 
                  className="w-full bg-slate-50 border border-slate-100 pl-5 pr-14 py-3.5 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
                />
                <span className="absolute right-4 top-[15px] text-xs font-semibold text-slate-400">kcal</span>
              </div>
              <button type="submit" className="bg-purple-600 text-white px-6 flex items-center justify-center gap-2 rounded-2xl active:scale-95 transition-transform shadow-md shadow-purple-200 text-sm font-semibold">
                <Plus size={18} /> Tambah
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
            {foodLog.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100/50">
                <p className="text-xs font-medium text-slate-400">Belum ada makanan dicatat hari ini.</p>
              </div>
            ) : (
              foodLog.map((food) => (
                <div key={food.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{food.name}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{new Date(food.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-sm font-bold text-orange-500">{food.calories} <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">kcal</span></span>
                    <button onClick={() => handleDeleteFood(food.id)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileDiet;