import React from 'react';
import { Typography, Card, CardContent, Grid, Button } from '@mui/material';

function AdminDashboard() {
  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">Admin Dashboard</Typography>
      <Typography variant="subtitle1" paragraph>System overview and placement analytics.</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Overall Placement Rate</Typography>
              <Typography variant="h3" color="primary">84%</Typography>
              <Button variant="outlined" sx={{ mt: 2 }}>View Full Report</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">System Health</Typography>
              <Typography variant="body1" color="success.main">● AI Microservice Online</Typography>
              <Typography variant="body1" color="success.main">● Database Connected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default AdminDashboard;