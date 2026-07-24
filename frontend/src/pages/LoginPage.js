import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, 
  Button, MenuItem, Alert, Box, InputAdornment, Avatar 
} from '@mui/material';
import { 
  LockOutlined, Person, Security, Badge, Login as LoginIcon 
} from '@mui/icons-material';
import axios from 'axios';

// 💡 CRITICAL: Ensure Axios accepts and sends Session Cookies for authentication
axios.defaults.withCredentials = true;

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username, password, role
      });
      
      if (response.data.status === 'success') {
        // The backend automatically sets the HTTP-Only Session Cookie here.
        // No need for localStorage!
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server offline. Cannot verify login.");
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f4f6f8 0%, #e3e8ec 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={6} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)'
            }}
          >
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'white', 
                color: 'primary.main', 
                mx: 'auto', 
                mb: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <LockOutlined fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              EduAI Portal
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Secure Authentication System
            </Typography>
          </Box>

          {/* Form Section */}
          <CardContent sx={{ p: 5 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontWeight: 'medium' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField 
                select 
                fullWidth 
                label="Select Account Type" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                sx={{ mb: 3 }}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security color="primary" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="Admin">System Administrator</MenuItem>
                <MenuItem value="Teacher">Faculty / Teacher</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
              </TextField>

              <TextField 
                fullWidth 
                label="Username or ID" 
                variant="outlined" 
                sx={{ mb: 3 }}
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField 
                fullWidth 
                label="Password" 
                type="password" 
                variant="outlined" 
                sx={{ mb: 4 }}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<LoginIcon />}
                sx={{ 
                  py: 1.8, 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                  }
                }}
              >
                Secure Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default LoginPage;