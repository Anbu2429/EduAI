import React from 'react';
import { Typography, Grid, Card, Box, Button, Divider, Stack } from '@mui/material';
import { People, AssignmentTurnedIn, BarChart, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Attendance Monitor', desc: 'Manage live class attendance', icon: <People fontSize="large" />, path: '/teacher/attendance', color: '#1976d2' },
    { title: 'AI Gradebook', desc: 'Auto-evaluate student queries', icon: <AssignmentTurnedIn fontSize="large" />, color: '#2e7d32' },
    { title: 'Class Analytics', desc: 'View student performance trends', icon: <BarChart fontSize="large" />, color: '#ed6c02' },
    { title: 'Course Materials', desc: 'Upload and manage resources', icon: <School fontSize="large" />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ p: 5, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight="900" sx={{ color: '#1a237e' }}>Welcome back, Professor!</Typography>
        <Typography variant="h6" color="text.secondary">Everything you need to manage your classroom in one place.</Typography>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={4}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              p: 3, borderRadius: 4, textAlign: 'center', transition: '0.3s',
              '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }
            }}>
              <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{item.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{item.desc}</Typography>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ borderRadius: 2, fontWeight: 'bold' }}
                onClick={() => item.path && navigate(item.path)}
              >
                Launch
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary Footer */}
      <Divider sx={{ my: 6 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Today's Schedule</Typography>
        <Button variant="contained" sx={{ borderRadius: 2 }}>View Full Calendar</Button>
      </Stack>
    </Box>
  );
}

export default TeacherDashboard;