import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// import AdminProfile from "./pages/AdminProfile";
// import TeacherProfile from "./pages/TeacherProfile";
import StudentProfile from "./pages/StudentProfile";

import AttendanceMonitor from "./pages/AttendanceMonitor";

import Layout from "./components/Layout";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  };

  return (
    <Router>
      <Layout user={currentUser} onLogout={handleLogout}>
        {!currentUser ? (
          <LoginPage onLoginSuccess={setCurrentUser} />
        ) : (
          <Routes>

            {/* ================= ADMIN ================= */}
            {currentUser.role === "Admin" && (
              <>
                <Route path="/" element={<AdminDashboard />} />
                {/* <Route
                  path="/profile"
                  element={<AdminProfile user={currentUser} />}
                /> */}
              </>
            )}

            {/* ================= TEACHER ================= */}
            {currentUser.role === "Teacher" && (
              <>
                <Route path="/" element={<TeacherDashboard />} />

                {/* <Route
                  path="/profile"
                  element={<TeacherProfile user={currentUser} />}
                /> */}

                <Route
                  path="/teacher/attendance"
                  element={<AttendanceMonitor />}
                />
              </>
            )}  

            {/* ================= STUDENT ================= */}
            {currentUser.role === "Student" && (
              <>
                <Route
                  path="/"
                  element={<StudentDashboard user={currentUser} />}
                />

                <Route
                  path="/profile"
                  element={<StudentProfile user={currentUser} />}
                />
              </>
            )}

            {/* ================= INVALID ROUTE ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        )}
      </Layout>
    </Router>
  );
}

export default App;