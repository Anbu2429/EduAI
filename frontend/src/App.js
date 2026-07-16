import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Chip } from '@mui/material';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  // null means not logged in. If logged in, it holds { username, role }
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If there is no user logged in, force them to the Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={setCurrentUser} />;
  }

  return (
    <Router>
      <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              EduAI Portal
            </Typography>
            <Chip label={`Logged in as: ${currentUser.username} (${currentUser.role})`} sx={{ bgcolor: 'white', mr: 2 }} />
            <Button color="inherit" onClick={handleLogout} sx={{ border: '1px solid white' }}>Logout</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            {/* Route Protection: Only allow access if the role matches */}
            {currentUser.role === 'Admin' && <Route path="/*" element={<AdminDashboard />} />}
            {currentUser.role === 'Teacher' && <Route path="/*" element={<TeacherDashboard />} />}
            {currentUser.role === 'Student' && <Route path="/*" element={<StudentDashboard username={currentUser.username} />} />}
            
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;