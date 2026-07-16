import React from 'react';
import { Typography, Card, CardContent, Grid, Alert, Button } from '@mui/material';

function TeacherDashboard() {
  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">Teacher Dashboard</Typography>
      <Typography variant="subtitle1" paragraph>Class attendance and assessment monitoring.</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Action Required: Attendance Alerts</Typography>
              <Alert severity="warning" sx={{ mb: 1 }}>Anbuselvan S (Batch 6) - Absent for 3 consecutive afternoon sessions.</Alert>
              <Alert severity="warning">Heera Mohamed (Batch 6) - Below 75% threshold.</Alert>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Evaluate Recent Assessments</Typography>
              <Typography variant="body2" paragraph>Run BERT analysis on Batch 6 SQL query submissions.</Typography>
              <Button variant="contained" color="secondary">Run BERT Evaluator</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default TeacherDashboard;