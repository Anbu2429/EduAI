import React, { useState } from 'react';
import { Typography, Card, CardContent, Grid, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

function StudentDashboard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkReadiness = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/placement/analyze', {
        studentId: "727823TUAD009", name: "Anbuselvan S", attendance: 92, assessmentScore: 8.8
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">Student Dashboard</Typography>
      <Typography variant="subtitle1" paragraph>Welcome back, Anbuselvan S.</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>My Placement Readiness</Typography>
              <Button variant="contained" onClick={checkReadiness} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit"/> : "Analyze My Profile"}
              </Button>
              
              {result && (
                <div style={{ marginTop: '20px' }}>
                  <Typography variant="body1"><strong>Score:</strong> {result.readiness_score}%</Typography>
                  <Typography variant="body1"><strong>Status:</strong> {result.prediction}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{result.shap_explanation}</Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default StudentDashboard;