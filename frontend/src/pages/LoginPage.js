import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import axios from 'axios';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username, password, role
      });
      
      // If successful, pass the user data to App.js
      if (response.data.status === 'success') {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError("Invalid credentials or role mismatch.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={6}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" align="center" color="primary">
            EduAI Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField 
              select fullWidth label="Select Role" value={role} 
              onChange={(e) => setRole(e.target.value)} sx={{ mb: 3 }}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Teacher">Teacher</MenuItem>
              <MenuItem value="Student">Student</MenuItem>
            </TextField>

            <TextField 
              fullWidth label="Username" variant="outlined" sx={{ mb: 3 }}
              value={username} onChange={(e) => setUsername(e.target.value)} required 
            />
            <TextField 
              fullWidth label="Password" type="password" variant="outlined" sx={{ mb: 4 }}
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />

            <Button fullWidth type="submit" variant="contained" color="primary" size="large">
              Secure Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LoginPage;