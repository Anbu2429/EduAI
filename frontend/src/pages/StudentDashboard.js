import React, { useState } from 'react';
import { 
  Typography, Grid, Card, CardContent, Box, Button, 
  CircularProgress, LinearProgress, Paper, Chip, Fade, IconButton, Stack 
} from '@mui/material';
import { Analytics, CheckCircle, TrendingUp, Speed, UploadFile, Delete } from '@mui/icons-material';
import axios from 'axios';

function StudentDashboard({ username }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);

  const checkReadiness = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/placement/analyze', {
        studentId: "727823TUAD009", name: username, attendance: 92, assessmentScore: 8.8
      });
      setResult(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) setResume(file);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f7fa', minHeight: '100vh' }}>
      <Typography variant="h3" fontWeight="900" sx={{ color: '#1a237e', mb: 1 }}>My Learning Hub</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Track your career readiness and growth.</Typography>

      <Grid container spacing={4}>
        {/* Placement Readiness & Resume Upload */}
        <Grid item xs={12} md={6}>
          <Stack spacing={4}>
            {/* Readiness Card */}
            <Card elevation={0} sx={{ borderRadius: 4, p: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics color="primary" /> Placement Readiness
                </Typography>
                {!result ? (
                  <Button variant="contained" size="large" onClick={checkReadiness} disabled={loading} sx={{ borderRadius: 2 }}>
                    {loading ? <CircularProgress size={24} color="inherit"/> : "Analyze My Profile"}
                  </Button>
                ) : (
                  <Fade in>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                        <Typography variant="h2" fontWeight="900">{result.readiness_score}%</Typography>
                        <Chip label={result.prediction} color="success" sx={{ fontWeight: 'bold' }} />
                      </Box>
                      <LinearProgress variant="determinate" value={result.readiness_score} sx={{ height: 12, borderRadius: 5, mb: 2 }} />
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>

            {/* Resume Upload Card */}
            <Card elevation={0} sx={{ borderRadius: 4, p: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UploadFile color="secondary" /> Resume Upload
                </Typography>
                {!resume ? (
                  <Button component="label" variant="outlined" fullWidth sx={{ py: 4, borderStyle: 'dashed', borderRadius: 3 }}>
                    Click to Upload Resume (.pdf)
                    <input type="file" hidden accept=".pdf" onChange={handleResumeUpload} />
                  </Button>
                ) : (
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f1f8e9', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold">{resume.name}</Typography>
                    <IconButton color="error" onClick={() => setResume(null)}><Delete /></IconButton>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Status Highlights */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {[
              { title: 'Current Attendance', val: '92%', icon: <Speed />, color: '#1976d2' },
              { title: 'Completed Modules', val: '14', icon: <CheckCircle />, color: '#2e7d32' },
              { title: 'Next Assessment', val: 'July 25', icon: <TrendingUp />, color: '#ed6c02' },
            ].map((stat, i) => (
              <Grid item xs={12} key={i}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
                  <Box sx={{ p: 1.5, bgcolor: `${stat.color}15`, color: stat.color, borderRadius: 2 }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{stat.title}</Typography>
                    <Typography variant="h6" fontWeight="bold">{stat.val}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentDashboard;