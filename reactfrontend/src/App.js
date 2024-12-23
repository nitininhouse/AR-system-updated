import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RevieweeDashboard from './pages/RevieweeDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import Dashboard from './pages/Dashboard';
import AssignmentDetails from './pages/AssignmentDetails';
import AssignmentDetailsnew from './pages/AssignmentDetailsnew';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard-reviewee" element={<RevieweeDashboard />} />
        <Route path="/dashboard-reviewer" element={<ReviewerDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assignments/:id" element={<AssignmentDetails />} />
        <Route path="/assignments/reviewer/:id" element={<AssignmentDetailsnew />} />
      </Routes>
    </Router>
  );
}

export default App;
