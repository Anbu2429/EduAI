import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";

import {
  Analytics,
  UploadFile,
  TrendingUp,
  CheckCircle,
  Assignment,
  School,
  Notifications,
  Description,
  ArrowForward,
  Delete,
  SmartToy,
} from "@mui/icons-material";

import axios from "axios";

// 💡 CRITICAL: Ensure Session Cookies are sent
axios.defaults.withCredentials = true;

function StudentDashboard() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const [resume, setResume] = useState(null);
  const [result, setResult] = useState(null);

  // ===============================
  // FETCH USER & PROFILE DATA
  // ===============================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get Logged In User
        const userRes = await axios.get("http://localhost:8080/api/auth/me");
        setUser(userRes.data);

        // 2. Get Student Profile
        const profileRes = await axios.get(`http://localhost:8080/api/student/profile/user/${userRes.data.id}`);
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ===============================
  // DYNAMIC VARIABLES
  // ===============================
  const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : (user?.username || "Student");
  const photoUrl = profile?.profilePhoto ? `http://localhost:8080/uploads/profile/students/${profile.profilePhoto}` : "";
  const displayCgpa = profile?.cgpa || 8.0;

  // Dynamically generate skill progress based on database string (e.g., "Java, React, SQL")
  const getDynamicSkills = () => {
    if (!profile?.skills) return [["Java", 90], ["React", 75], ["SQL", 82]]; // Fallback
    
    // Split by comma, trim spaces, and assign a visual score based on order
    const skillArray = profile.skills.split(",").map(s => s.trim()).filter(s => s);
    return skillArray.map((skill, index) => {
      // Create a visual score (just for dashboard UI purposes)
      const visualScore = Math.max(60, 95 - (index * 8)); 
      return [skill, visualScore];
    }).slice(0, 5); // Show max 5 skills
  };

  const dynamicSkills = getDynamicSkills();
  const averageSkillScore = Math.round(dynamicSkills.reduce((acc, curr) => acc + curr[1], 0) / dynamicSkills.length) || 0;

  // ===============================
  // API CALLS
  // ===============================
  const checkReadiness = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/placement/analyze",
        {
          // 💡 Use actual DB data for the AI Analysis
          studentId: profile?.registerNumber || "UNKNOWN",
          name: profile?.firstName || displayName,
          attendance: 92, // Update if you add this to DB later
          assessmentScore: displayCgpa,
        }
      );
      setResult(response.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const handleResumeUpload = (e) => {
    if (e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  // ===============================
  // RENDER LOADING / NO PROFILE
  // ===============================
  if (loadingProfile) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f4f6fb">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "#f4f6fb",
        minHeight: "100vh",
        p: 3,
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* ---------------- HERO ---------------- */}
      <Paper
        elevation={4}
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(90deg,#0d47ff,#173bc9,#2336c6)",
          color: "white",
          p: 4,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ opacity: 0.8, fontWeight: 600, letterSpacing: 1 }}>
            WELCOME BACK
          </Typography>

          <Typography variant="h3" fontWeight="700" sx={{ mt: 0.5 }}>
            {displayName}
          </Typography>

          <Typography sx={{ mt: 1, opacity: 0.92, fontSize: 18 }}>
            Track your courses, monitor placement readiness, upload your
            resume and improve your skills using EduAI.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: "white",
                color: "#0d47ff",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              CONTINUE LEARNING
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              VIEW QUIZ
            </Button>
          </Stack>
        </Box>

        <Avatar
          src={photoUrl}
          sx={{
            width: 96,
            height: 96,
            fontSize: 45,
            bgcolor: "transparent",
            border: "2px solid rgba(255,255,255,.8)",
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </Paper>

      {/* ---------------- TOP CARDS ---------------- */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        
        {/* Placement Readiness */}
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar sx={{ width: 80, height: 80, bgcolor: "#edf2ff", color: "#2458ff" }}>
                <Analytics sx={{ fontSize: 42 }} />
              </Avatar>
              <Box flex={1}>
                <Typography color="text.secondary" fontSize={17}>Placement Readiness</Typography>
                <Typography variant="h3" color="#2458ff" fontWeight="bold">
                  {result ? `${result.readiness_score}%` : "86%"}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={result ? result.readiness_score : 86}
                  sx={{ mt: 2, height: 6, borderRadius: 4 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Academic Performance (Using DB CGPA) */}
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar sx={{ width: 80, height: 80, bgcolor: "#e9f9ef", color: "#17a34a" }}>
                <CheckCircle sx={{ fontSize: 42 }} />
              </Avatar>
              <Box flex={1}>
                <Typography color="text.secondary" fontSize={17}>Current CGPA</Typography>
                <Typography variant="h3" color="#16a34a" fontWeight="bold">
                  {displayCgpa}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={displayCgpa * 10} // Convert 10.0 scale to 100% scale
                  color="success"
                  sx={{ mt: 2, height: 6, borderRadius: 4 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* ---------------- AI ANALYSIS + RESUME ---------------- */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
        
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 2 }}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#edf2ff", width: 60, height: 60, color: "#2458ff" }}>
                    <SmartToy />
                  </Avatar>
                  <Typography variant="h5" fontWeight="700">AI Placement Analysis</Typography>
                </Stack>
                <Typography sx={{ mt: 3, color: "text.secondary", lineHeight: 1.8, fontSize: 17 }}>
                  Analyze your profile and discover your placement readiness score based on your academic record.
                </Typography>

                {!result ? (
                  <Button
                    variant="contained"
                    onClick={checkReadiness}
                    disabled={loading || !profile} // Disable if profile isn't filled out
                    sx={{
                      mt: 4, borderRadius: 2, px: 4, py: 1.3, fontWeight: "bold", bgcolor: "#2458ff",
                    }}
                  >
                    {loading ? <CircularProgress size={22} color="inherit" /> : "ANALYZE MY PROFILE"}
                  </Button>
                ) : (
                  <Box mt={3}>
                    <Chip label={result.prediction} color="success" sx={{ mb: 2, fontWeight: "bold" }} />
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {result.readiness_score}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.readiness_score}
                      sx={{ mt: 2, height: 10, borderRadius: 5 }}
                    />
                  </Box>
                )}
              </Box>
              <Box sx={{ width: 180, height: 180, display: "flex", alignItems: "flex-end", justifyContent: "space-evenly" }}>
                <Box sx={{ width: 20, height: 55, bgcolor: "#d6e2ff", borderRadius: 2 }} />
                <Box sx={{ width: 20, height: 90, bgcolor: "#a9c3ff", borderRadius: 2 }} />
                <Box sx={{ width: 20, height: 75, bgcolor: "#7da7ff", borderRadius: 2 }} />
                <Box sx={{ width: 20, height: 120, bgcolor: "#2458ff", borderRadius: 2 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 2 }}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#f1e8ff", color: "#7c4dff", width: 60, height: 60 }}>
                    <Description />
                  </Avatar>
                  <Typography variant="h5" fontWeight="700">Resume</Typography>
                </Stack>
                <Typography sx={{ mt: 3, color: "text.secondary", lineHeight: 1.8, fontSize: 17 }}>
                  Upload your resume (PDF only) and get AI-powered suggestions.
                </Typography>

                {!resume ? (
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadFile />}
                    sx={{ mt: 4, bgcolor: "#7c4dff", px: 4, py: 1.3, borderRadius: 2 }}
                  >
                    UPLOAD RESUME
                    <input hidden accept=".pdf" type="file" onChange={handleResumeUpload} />
                  </Button>
                ) : (
                  <Paper sx={{ mt: 4, p: 2, bgcolor: "#f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 2 }}>
                    <Typography fontWeight="bold">{resume.name}</Typography>
                    <IconButton color="error" onClick={() => setResume(null)}>
                      <Delete />
                    </IconButton>
                  </Paper>
                )}
              </Box>
              <Avatar sx={{ width: 120, height: 120, bgcolor: "#fafafa", color: "#bdbdbd" }}>
                <Description sx={{ fontSize: 70 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ---------------- BOTTOM SECTION ---------------- */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3 }}>
        
        {/* Quizzes */}
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: "#efe7ff", color: "#7c4dff" }}><Assignment /></Avatar>
              <Typography variant="h6" fontWeight="700">Quizzes</Typography>
            </Stack>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Java Basics" secondary="15 Questions • Completed" />
                <Chip label="92%" color="success" variant="outlined" />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disableGutters>
                <ListItemText primary="React Fundamentals" secondary="20 Questions • Completed" />
                <Chip label="78%" color="success" variant="outlined" />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disableGutters>
                <ListItemText primary="SQL Joins" secondary="12 Questions • In Progress" />
                <Button size="small">Resume</Button>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: "#edf2ff", color: "#2458ff" }}><School /></Avatar>
              <Typography variant="h6" fontWeight="700">Upcoming Tasks</Typography>
            </Stack>
            <Stack spacing={3}>
              <Box>
                <Typography fontWeight="600">🔵 SQL Assignment</Typography>
                <Typography color="text.secondary" variant="body2">Tomorrow</Typography>
              </Box>
              <Box>
                <Typography fontWeight="600">🟢 Mock Interview</Typography>
                <Typography color="text.secondary" variant="body2">28 July</Typography>
              </Box>
              <Box>
                <Typography fontWeight="600">🟣 Resume Submission</Typography>
                <Typography color="text.secondary" variant="body2">1 August</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Dynamic Skill Progress */}
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent sx={{ p: 3.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={3.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#edf2ff", color: "#2458ff" }}><TrendingUp /></Avatar>
                <Typography variant="h6" fontWeight="700">Skill Progress</Typography>
              </Stack>
              <Typography variant="caption" fontWeight="700" sx={{ color: "#2458ff", bgcolor: "#edf2ff", px: 1.2, py: 0.5, borderRadius: 5 }}>
                {averageSkillScore}% avg
              </Typography>
            </Stack>

            <Stack spacing={2.75}>
              {dynamicSkills.length > 0 ? dynamicSkills.map(([skill, score]) => {
                const level = score >= 85 ? { label: "Advanced", color: "#17a34a", bg: "#e9f9ef" }
                            : score >= 70 ? { label: "Proficient", color: "#2458ff", bg: "#edf2ff" }
                            : { label: "Improving", color: "#fb8c00", bg: "#fff3e0" };

                return (
                  <Stack key={skill} spacing={1.1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography fontWeight="600">{skill}</Typography>
                        <Typography variant="caption" fontWeight="700" sx={{ color: level.color, bgcolor: level.bg, px: 1, py: 0.3, borderRadius: 4, lineHeight: 1.4 }}>
                          {level.label}
                        </Typography>
                      </Stack>
                      <Typography fontWeight="bold" sx={{ color: level.color }}>{score}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        height: 8, borderRadius: 5, bgcolor: "#eef1f8",
                        "& .MuiLinearProgress-bar": { borderRadius: 5, background: `linear-gradient(90deg, ${level.color}99, ${level.color})` },
                      }}
                    />
                  </Stack>
                );
              }) : (
                <Typography color="text.secondary">Add skills in your profile to see progress.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: "#fff3e0", color: "#fb8c00" }}><Notifications /></Avatar>
              <Typography variant="h6" fontWeight="700">Notifications</Typography>
            </Stack>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemText primary="Placement Drive" secondary="TCS registration closes tomorrow." />
              </ListItem>
              <Divider />
              <ListItem disableGutters>
                <ListItemText primary="Resume Review" secondary="Upload the latest resume." />
              </ListItem>
              <Divider />
              <ListItem disableGutters>
                <ListItemText primary="Profile Update" secondary="Please ensure your CGPA is up to date." />
              </ListItem>
            </List>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}

export default StudentDashboard;