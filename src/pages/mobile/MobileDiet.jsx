import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Scale, Flame, Target, Utensils, Plus, TrendingDown, Activity, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MobileDiet = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: 'Pelari', height: 170, weight: 70, gender: 'L', age: 25, activityLevel: 1.375 
  });
  const [foodLog, setFoodLog] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCal, setNewFoodCal] = useState('');
  const [newWeight, setNewWeight] = useState('');

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

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!newFoodName || !newFoodCal) return;

    const newEntry = {
      id: Date.now().toString(), name: newFoodName, calories: parseInt(newFoodCal), time: new Date().toISOString()
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
    <div className="min-h-screen bg-slate-950 pb-24 text-white font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <div className="fixed top-0 w-full max-w-md mx-auto bg-slate-950/90 backdrop-blur-md z-40 px-5 h-16 flex items-center justify-between border-b border-slate-900">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-slate-300 active:bg-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold tracking-tight text-white">Diet & Berat Badan</h1>
        <div className="w-10"></div>
      </div>

      <div className="pt-20 px-5 space-y-6">
        
        {/* KARTU TARGET KALORI HARIAN */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800 flex flex-col items-center relative overflow-hidden">
          <div className="flex w-full justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Target size={18} className="text-[#ccff00]"/> Target Harian</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-950 bg-[#ccff00] px-3 py-1.5 rounded-lg border border-[#ccff00]/50 shadow-[0_0_10px_rgba(204,255,0,0.3)]">{dietGoal}</span>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center mb-6 mt-2">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="76" stroke="#1e293b" strokeWidth="12" fill="transparent" />
              <circle 
                cx="88" cy="88" r="76" 
                stroke="#ccff00" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 76} 
                strokeDashoffset={(2 * Math.PI * 76) - (progressPercent / 100) * (2 * Math.PI * 76)} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <Flame size={24} className="text-orange-500 mb-1" />
              <span className="text-5xl font-black text-white tracking-tighter">{remainingCalories}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kcal Tersisa</span>
            </div>
          </div>

          <div className="flex justify-between w-full px-6 py-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Target</p>
              <p className="font-black text-white text-base">{targetCalories}</p>
            </div>
            <div className="w-px h-8 bg-slate-800 my-auto"></div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Dikonsumsi</p>
              <p className="font-black text-[#ccff00] text-base">{consumedCalories}</p>
            </div>
          </div>
        </div>

        {/* KALKULATOR TDEE & BMR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
              <Activity size={18} className="text-[#ccff00]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">BMR (Basal)</p>
            <h3 className="text-xl font-black text-white tracking-tight">{Math.round(bmr)} <span className="text-[10px] font-bold text-slate-500 tracking-normal">kcal/hr</span></h3>
          </div>
          <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-lg border border-slate-800 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 border border-slate-700">
              <Flame size={18} className="text-orange-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">TDEE (Total)</p>
            <h3 className="text-xl font-black text-white tracking-tight">{tdee} <span className="text-[10px] font-bold text-slate-500 tracking-normal">kcal/hr</span></h3>
          </div>
        </div>

        {/* PROGRESS BERAT BADAN & GRAFIK */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Scale size={18} className="text-[#ccff00]"/> Berat Badan</h2>
            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${bmiStatus === 'Normal' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-orange-900/30 text-orange-400 border-orange-800'}`}>
              BMI: {bmi.toFixed(1)} ({bmiStatus})
            </div>
          </div>

          <div className="flex justify-between items-end mb-6 px-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00] mb-1">Saat Ini</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{profile.weight} <span className="text-sm font-bold text-slate-500 tracking-normal">kg</span></h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Ideal (Target)</p>
              <h3 className="text-xl font-bold text-slate-300">{idealWeight.toFixed(1)} <span className="text-xs font-bold text-slate-500">kg</span></h3>
            </div>
          </div>

          <form onSubmit={handleUpdateWeight} className="mb-8 relative">
            <div className="relative w-full">
              <input 
                type="number" 
                step="0.1" 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value)} 
                placeholder="Update berat (kg)" 
                className="w-full bg-slate-950 border border-slate-800 pl-5 pr-28 py-3.5 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#ccff00] transition-all placeholder-slate-600"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-[#ccff00] text-slate-950 px-5 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                Simpan
              </button>
            </div>
          </form>

          {/* Grafik Recharts Mode Gelap */}
          <div className="h-40 w-full min-w-[10px] min-h-[10px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="dateStr" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', fontFamily: 'Poppins' }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', fontFamily: 'Poppins' }} />
                  <Area type="monotone" dataKey="weight" stroke="#ccff00" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e293b', backgroundColor: '#0f172a', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontWeight: 'bold', color: '#fff', fontSize: '12px', fontFamily: 'Poppins' }} formatter={(value) => [`${value} kg`, 'Berat']} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">Data belum cukup</div>
            )}
          </div>
        </div>

        {/* LOG MAKANAN HARIAN */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-6"><Utensils size={18} className="text-[#ccff00]"/> Konsumsi Hari Ini</h2>
          
          <form onSubmit={handleAddFood} className="flex flex-col gap-3 mb-8">
            <input 
              type="text" 
              value={newFoodName} 
              onChange={(e) => setNewFoodName(e.target.value)} 
              placeholder="Nama Makanan (Cth: Nasi Goreng)" 
              className="w-full bg-slate-950 border border-slate-800 px-5 py-3.5 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#ccff00] transition-all placeholder-slate-600"
            />
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  value={newFoodCal} 
                  onChange={(e) => setNewFoodCal(e.target.value)} 
                  placeholder="Jumlah Kalori" 
                  className="w-full bg-slate-950 border border-slate-800 pl-5 pr-14 py-3.5 rounded-2xl text-sm font-bold text-white outline-none focus:border-[#ccff00] transition-all placeholder-slate-600"
                />
                <span className="absolute right-4 top-[15px] text-xs font-bold text-slate-500">kcal</span>
              </div>
              <button type="submit" className="bg-slate-800 border border-slate-700 text-[#ccff00] px-6 flex items-center justify-center gap-2 rounded-2xl active:scale-95 transition-transform shadow-md text-sm font-bold">
                <Plus size={18} /> Tambah
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
            {foodLog.length === 0 ? (
              <div className="text-center py-6 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-500">Belum ada makanan dicatat hari ini.</p>
              </div>
            ) : (
              foodLog.map((food) => (
                <div key={food.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-white">{food.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{new Date(food.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-sm font-black text-[#ccff00]">{food.calories} <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">kcal</span></span>
                    <button onClick={() => handleDeleteFood(food.id)} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 hover:text-red-500 active:scale-90 transition-all border border-slate-800">
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