import React from 'react';
import { Users, Route, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  // Data dummy untuk grafik
  const chartData = [
    { name: 'Sen', jarak: 120 },
    { name: 'Sel', jarak: 150 },
    { name: 'Rab', jarak: 180 },
    { name: 'Kam', jarak: 140 },
    { name: 'Jum', jarak: 210 },
    { name: 'Sab', jarak: 320 },
    { name: 'Min', jarak: 400 },
  ];

  // Data dummy untuk tabel
  const recentActivities = [
    { id: 1, user: 'Budi Santoso', title: 'Lari Pagi Sudirman', distance: '5.2 km', pace: '06:15/km', date: 'Hari ini' },
    { id: 2, user: 'Siti Aminah', title: 'Night Run GBK', distance: '10.0 km', pace: '05:45/km', date: 'Hari ini' },
    { id: 3, user: 'Andi Wijaya', title: 'Recovery Run', distance: '3.5 km', pace: '07:20/km', date: 'Kemarin' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Ringkasan aktivitas platform minggu ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
            <h3 className="text-2xl font-bold text-gray-900">1,245</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-green-100 text-green-600">
            <Route size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Jarak (Minggu)</p>
            <h3 className="text-2xl font-bold text-gray-900">1,520 km</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Waktu Lari</p>
            <h3 className="text-2xl font-bold text-gray-900">342 Jam</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aktivitas Baru</p>
            <h3 className="text-2xl font-bold text-gray-900">+84</h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Grafik Total Jarak Harian (km)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="jarak" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Aktivitas Lari Terbaru</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Pengguna</th>
                <th className="px-6 py-3 font-medium">Judul Aktivitas</th>
                <th className="px-6 py-3 font-medium">Jarak</th>
                <th className="px-6 py-3 font-medium">Pace Rata-rata</th>
                <th className="px-6 py-3 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{activity.user}</td>
                  <td className="px-6 py-4">{activity.title}</td>
                  <td className="px-6 py-4 font-medium">{activity.distance}</td>
                  <td className="px-6 py-4">{activity.pace}</td>
                  <td className="px-6 py-4">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;