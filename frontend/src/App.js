import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Layout from './components/Layout'; // Import your new Layout
import ProfilePage from './pages/ProfilePage';
import AttendanceMonitor from './pages/AttendanceMonitor';

function App() {
  // null means not logged in. Holds { username, role } if logged in.
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      {/* Wrap everything in Layout. Layout handles showing/hiding the Navbar automatically based on currentUser */}
      <Layout user={currentUser} onLogout={handleLogout}>
        
        {!currentUser ? (
          // If not logged in, show Login
          <LoginPage onLoginSuccess={setCurrentUser} />
        ) : (
          // If logged in, show Dashboard routes
          <Routes>
            {currentUser.role === 'Admin' && <Route path="/*" element={<AdminDashboard />} />}
            {currentUser.role === 'Teacher' && <Route path="/*" element={<TeacherDashboard />} />}
            {currentUser.role === 'Student' && <Route path="/*" element={<StudentDashboard username={currentUser.username} />} />}
            {currentUser.role && <Route path="/profile" element={<ProfilePage user={currentUser} />} />}
            {currentUser.role === 'Teacher' && <Route path="/teacher/attendance" element={<AttendanceMonitor />} />}
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
        
      </Layout>
    </Router>
  );
}

export default App;