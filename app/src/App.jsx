import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GraduationCap, Briefcase, FileText, Rocket, Award, BookmarkCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import OpportunitiesList from './pages/OpportunitiesList';
import Profile from './pages/Profile';
import Vault from './pages/Vault';
import Login from './pages/Login';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { fetchOpportunities } from './services/api';
import { opportunities as fallbackData } from './data/mockData';
import './index.css';

import { useAuth } from './contexts/AuthContext';
import { getUserApplications, updateApplicationStatus, deleteApplication, getUserProfile, updateUserProfile } from './services/db';

function AppContent() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [liveData, setLiveData] = useState(fallbackData);
  const [lastFetched, setLastFetched] = useState(new Date());
  
  // Array of { opportunity_id, status }
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchOpportunities();
      if (data && data.length > 0) {
        setLiveData(data);
        setLastFetched(new Date());
      }
    }
    loadData();
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (user) {
      getUserApplications(user.id).then(data => setApplications(data));
      getUserProfile(user.id).then(data => {
        if (data) {
          setUserProfile({
            name: data.full_name,
            age: data.age,
            education: data.education,
            percentage: data.percentage,
            category: data.category
          });
        }
      });
    }
  }, [user]);

  const handleSaveProfile = async (profileData) => {
    setUserProfile(profileData);
    if (user) {
      await updateUserProfile(user.id, profileData);
    }
  };

  const toggleSave = async (id, status = 'Saved') => {
    if (!user) return;
    const existing = applications.find(a => a.opportunity_id === id);
    
    if (existing && existing.status === status) {
      // Toggle off if clicking the same status
      await deleteApplication(user.id, id);
      setApplications(prev => prev.filter(a => a.opportunity_id !== id));
    } else {
      // Upsert
      const updated = await updateApplicationStatus(user.id, id, status);
      setApplications(prev => {
        const filtered = prev.filter(a => a.opportunity_id !== id);
        return [...filtered, updated];
      });
    }
  };

  const savedIds = applications.map(a => a.opportunity_id);

  return (
    <div className="app-layout">
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="main-content">
        <Header
          onMenuToggle={() => setMenuOpen(o => !o)}
          menuOpen={menuOpen}
          lastFetched={lastFetched}
        />
        <main className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard userProfile={userProfile} opportunities={liveData} applications={applications} onUpdateStatus={toggleSave} />} />
            <Route path="/scholarships" element={
              <OpportunitiesList opportunities={liveData} type="scholarship" title="Scholarships" icon={GraduationCap} color="#bc8cff" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/jobs" element={
              <OpportunitiesList opportunities={liveData} type="job" title="Government Jobs" icon={Briefcase} color="#58a6ff" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/exams" element={
              <OpportunitiesList opportunities={liveData} type="exam" title="Exams" icon={FileText} color="#39c5cf" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/internships" element={
              <OpportunitiesList opportunities={liveData} type="internship" title="Internships" icon={Rocket} color="#3fb950" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/fellowships" element={
              <OpportunitiesList opportunities={liveData} type="fellowship" title="Fellowships" icon={Award} color="#d29922" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/saved" element={
              <OpportunitiesList opportunities={liveData.filter(o => savedIds.includes(o.id))} type="all" title="My Applications" icon={BookmarkCheck} color="#f0f6fc" userProfile={userProfile} applications={applications} onUpdateStatus={toggleSave} />
            } />
            <Route path="/profile" element={
              <Profile profile={userProfile} onSave={handleSaveProfile} />
            } />
            <Route path="/vault" element={<Vault />} />
          </Routes>
        </main>
        
        {/* Floating AI Chatbot */}
        <Chatbot userProfile={userProfile} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}