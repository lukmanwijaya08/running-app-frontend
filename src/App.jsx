import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Mobile
import MobileLayout from './components/layout/MobileLayout';
import MobileHome from './pages/mobile/MobileHome';
import MobileProfile from './pages/mobile/MobileProfile';
import MobileActivityDetail from './pages/mobile/MobileActivityDetail';
import MobileAddActivity from './pages/mobile/MobileAddActivity';
import MobileActivity from './pages/mobile/MobileActivity'; 
import MobileAuth from './pages/mobile/MobileAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Auth menggunakan MobileAuth yang baru */}
        <Route path="/login" element={<MobileAuth />} />
        <Route path="/register" element={<MobileAuth />} />

        {/* --- Mobile (User) Routes --- */}
        <Route path="/mobile" element={<MobileLayout />}>
          <Route index element={<MobileHome />} />
          <Route path="activities" element={<MobileActivity />} />
          <Route path="profile" element={<MobileProfile />} />
        </Route>

        <Route path="/mobile/activity/:id" element={<MobileActivityDetail />} />
        <Route path="/mobile/add-activity" element={<MobileAddActivity />} />

        <Route path="/" element={<Navigate to="/mobile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;