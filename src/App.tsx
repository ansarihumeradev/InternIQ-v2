import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Internships from './pages/Internships';
import Companies from './pages/Companies';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CareerGuidance from './pages/CareerGuidance';
import ResumeBuilder from './pages/ResumeBuilder';
import InterviewPrep from './pages/InterviewPrep';
import SkillAssessment from './pages/SkillAssessment';
import TestAuth from './pages/TestAuth';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
import BackgroundService from './services/backgroundService';

function App() {
  useEffect(() => {
    // Initialize and start background service for daily job/internship updates
    const backgroundService = BackgroundService.getInstance();
    backgroundService.start();
    console.log('Background service started for daily updates');

    // Listen for background update notifications
    const handleBackgroundUpdate = (event: CustomEvent) => {
      const { jobCount, internshipCount } = event.detail;
      console.log(`Background update: ${jobCount} jobs, ${internshipCount} internships updated`);
      
      // Show notification to user
      if (document.visibilityState === 'visible') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
          <div class="flex items-center">
            <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <div class="text-sm font-medium">Jobs & Internships Updated!</div>
              <div class="text-xs text-green-600">${jobCount} jobs, ${internshipCount} internships refreshed</div>
            </div>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 5000);
      }
    };

    window.addEventListener('backgroundUpdate', handleBackgroundUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('backgroundUpdate', handleBackgroundUpdate as EventListener);
      backgroundService.stop();
    };
  }, []);

  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth pages — full screen, no Header/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login initialMode="signup" />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/auth/callback" element={<Navigate to="/login" replace />} />

            {/* All other pages — with Header + Footer */}
            <Route path="/*" element={
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Header />
                <motion.main
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/jobs" element={<Navigate to="/internships" replace />} />
                    <Route path="/internships" element={<Internships />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/career-guidance" element={<CareerGuidance />} />
                    <Route path="/mentorship" element={<CareerGuidance />} />
                    <Route path="/resume-builder" element={<ResumeBuilder />} />
                    <Route path="/interview-prep" element={<InterviewPrep />} />
                    <Route path="/skill-assessment" element={<SkillAssessment />} />
                    <Route path="/skill-development" element={<SkillAssessment />} />
                    <Route path="/online-branding" element={<CareerGuidance />} />
                    <Route path="/quick-apply" element={<Internships />} />
                    <Route path="/test-auth" element={<TestAuth />} />
                  </Routes>
                </motion.main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;