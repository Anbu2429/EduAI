import React from 'react';
import { 
  Box, Card, CardContent, Typography, Avatar, Grid, 
  TextField, Button, Divider, Paper, Stack, Chip 
} from '@mui/material';
import { Badge, Work } from '@mui/icons-material';

function ProfilePage({ user }) {
  return (
    <Box sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h4" fontWeight="900" gutterBottom>
        Account Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
            <Avatar 
              sx={{ width: 140, height: 140, mx: 'auto', mb: 2, bgcolor: '#1976d2', fontSize: '4rem', boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight="bold">{user.username}</Typography>
            <Chip label={user.role} color="primary" sx={{ mt: 1, fontWeight: 'bold', px: 1 }} />
            <Divider sx={{ my: 3 }} />
            <Stack spacing={2} alignItems="flex-start" sx={{ color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge fontSize="small" /> System User
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work fontSize="small" /> EduAI Institutional ID
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 4, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Edit Information</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Username" defaultValue={user.username} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Role" defaultValue={user.role} variant="outlined" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Display Name" placeholder="Enter your full name" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Institutional Email" defaultValue={`${user.username}@eduai.edu`} variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Bio" multiline rows={3} placeholder="Tell us about yourself..." variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" size="large" sx={{ py: 1.5, px: 4, borderRadius: 2, fontWeight: 'bold' }}>
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;