import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Mobile
import MobileLayout from './components/layout/MobileLayout';
import MobileHome from './pages/mobile/MobileHome';
import MobileProfile from './pages/mobile/MobileProfile';
import MobileActivityDetail from './pages/mobile/MobileActivityDetail';
import MobileAddActivity from './pages/mobile/MobileAddActivity';
import MobileActivity from './pages/mobile/MobileActivity'; 
import MobileAuth from './pages/mobile/MobileAuth';
import MobileDiet from './pages/mobile/MobileDiet';
import MobileTraining from './pages/mobile/MobileTraining';
import MobileRecovery from './pages/mobile/MobileRecovery';
import MobileStats from './pages/mobile/MobileStats';
import MobilePR from './pages/mobile/MobilePR';

// Import halaman Record Run yang baru dibuat
import MobileRecordRun from './pages/mobile/MobileRecordRun'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Auth menggunakan MobileAuth yang baru */}
        <Route path="/login" element={<MobileAuth />} />
        <Route path="/register" element={<MobileAuth />} />

        {/* --- Mobile (User) Routes --- */}
        {/* Rute yang menggunakan Bottom Navigation */}
        <Route path="/mobile" element={<MobileLayout />}>
          <Route index element={<MobileHome />} />
          <Route path="activities" element={<MobileActivity />} />
          <Route path="profile" element={<MobileProfile />} />
        </Route>

        {/* Rute Standalone (Layar Penuh tanpa Bottom Navigation) */}
        <Route path="/mobile/activity/:id" element={<MobileActivityDetail />} />
        <Route path="/mobile/add-activity" element={<MobileAddActivity />} />
        <Route path="/mobile/diet" element={<MobileDiet />} /> 
        <Route path="/mobile/training" element={<MobileTraining />} />
        <Route path="/mobile/recovery" element={<MobileRecovery />} />
        <Route path="/mobile/stats" element={<MobileStats />} />
        <Route path="/mobile/pr" element={<MobilePR />} />
        
        {/* Rute baru untuk fitur Live Tracking / Rekam Lari */}
        <Route path="/mobile/record-run" element={<MobileRecordRun />} />
        
        {/* Redirect default ke halaman mobile */}
        <Route path="/" element={<Navigate to="/mobile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;