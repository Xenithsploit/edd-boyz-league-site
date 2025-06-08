// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home';
import Navbar from './components/navbar';
import Teams from './pages/Teams';
import News from './pages/News';
import TeamPage from './pages/TeamPage';
import TeamSelect from './pages/TeamSelect';
import { UserProvider } from './contexts/UserContext';
import CommissionerDashboard from './pages/CommissionerDashboard';
import Profile from './pages/Profile';
import VODs from './pages/VODs.jsx';
import SubmitVOD from './pages/SubmitVOD.jsx';
import AdminVODReview from './pages/AdminVODReview.jsx';
import PredictionSubmission from './pages/predictionUI.jsx';
import AddMatchup from './pages/AddMatchup.jsx';

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element = {<Home />} />
          <Route path="/dashboard" element={<CommissionerDashboard />} />
          <Route path="/select-team" element={<TeamSelect />} />
          <Route path="/teams" element = {<Teams />} />
          <Route path="/news" element = {<News />} />
          <Route path="/teams/:teamSlug" element = {<TeamPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vods" element={<VODs />} />
          <Route path="/submit-vod" element={<SubmitVOD />} />
          <Route path="/VODreview" element={<AdminVODReview />} />
          <Route path="/predictionUI" element={<PredictionSubmission />} />        
          <Route path="/add-matchup" element={<AddMatchup />} />        
        </Routes>
      </Router>
    </UserProvider>
    
  );
}

export default App;
