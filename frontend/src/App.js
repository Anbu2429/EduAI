import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Container, Grid, Card, 
  CardContent, CardActions, Button, Chip, CircularProgress, Box, Alert
} from '@mui/material';
import axios from 'axios';

function App() {
  const [javaStatus, setJavaStatus] = useState("Checking Java Backend...");
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // 1. Check if the Java Server is online when the app loads
  useEffect(() => {
    axios.get('http://localhost:8080/api/status')
      .then(response => {
        setJavaStatus(response.data.message);
      })
      .catch(error => {
        setJavaStatus("Java Backend Offline. Please start Spring Boot.");
      });
  }, []);

  // 2. The function that triggers the full pipeline
  const analyzePlacement = async () => {
    setLoading(true);
    setPredictionResult(null);
    
    // Sample data based on your batch members
    const studentData = {
        studentId: "727823TUAD009", 
        name: "Anbuselvan S",
        attendance: 92,
        assessmentScore: 8.8
    };

    try {
      // React -> Java (8080) -> Python (5000)
      const response = await axios.post('http://localhost:8080/api/placement/analyze', studentData);
      setPredictionResult(response.data);
    } catch (error) {
      console.error("Pipeline Error:", error);
      setPredictionResult({ error: "Pipeline failed. Check your Java and Python terminals." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            EduAI Dashboard
          </Typography>
          <Chip 
            label={javaStatus.includes("online") ? "System Online" : "Connecting..."} 
            sx={{ backgroundColor: javaStatus.includes("online") ? '#66bb6a' : '#ffa726', color: 'white', fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            <strong>Server Status:</strong> {javaStatus}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Placement Predictor Module */}
          <Grid item xs={12} md={6}>
            <Card elevation={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                  💼 Placement Predictor
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Predict placement readiness using XGBoost. View skill gap analysis and SHAP explainability insights.
                </Typography>

                {/* Display Results Here */}
                {predictionResult && !predictionResult.error && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <strong>Score:</strong> {predictionResult.readiness_score}% <br/>
                    <strong>Prediction:</strong> {predictionResult.prediction} <br/>
                    <strong>SHAP Insights:</strong> {predictionResult.shap_explanation}
                  </Alert>
                )}

                {predictionResult && predictionResult.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>{predictionResult.error}</Alert>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  onClick={analyzePlacement}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Run AI Pipeline"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;