import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AppBar, Toolbar, Typography, Avatar, Box, Container, Menu, 
  MenuItem, Divider, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Alert 
} from '@mui/material';
import { Logout, School, Person, Home, VpnKey } from '@mui/icons-material';

function Layout({ user, onLogout, children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Password Modal State
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Navigations
  const handleGoHome = () => navigate('/');
  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  };

  // Open Password Modal
  const handleOpenPasswordModal = () => {
    handleClose();
    setMessage(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordOpen(true);
  };

  // Submit Password Change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match!" });
      return;
    }
    if (newPassword.length < 5) {
      setMessage({ type: 'error', text: "Password must be at least 5 characters long." });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put('http://localhost:8080/api/auth/change-password', 
        { newPassword: newPassword }, 
        { withCredentials: true }
      );
      
      setMessage({ type: 'success', text: response.data.message });
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        setPasswordOpen(false);
        setMessage(null);
      }, 2000);

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || "Failed to change password." });
    }
    setLoading(false);
  };

  if (!user) return <>{children}</>;

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar 
        position="sticky" 
        elevation={2} 
        sx={{ background: 'rgba(255, 255, 255, 0.95)', color: '#333', backdropFilter: 'blur(10px)' }}
      >
        <Toolbar>
          <IconButton onClick={handleGoHome} sx={{ mr: 1, color: '#1976d2', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } }}>
            <Home fontSize="medium" />
          </IconButton>

          <School sx={{ mr: 1, color: '#1976d2', fontSize: 32 }} />
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: '#1976d2' }}>
            EduAI Portal
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              {user?.username || 'User'}
            </Typography>
            
            <Avatar 
              onClick={handleClick}
              sx={{ bgcolor: '#1976d2', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleProfileClick}><Person sx={{ mr: 1 }} /> My Profile</MenuItem>
              
              {/* 💡 NEW MENU ITEM */}
              <MenuItem onClick={handleOpenPasswordModal}><VpnKey sx={{ mr: 1 }} /> Change Password</MenuItem>
              
              <Divider />
              <MenuItem onClick={() => { handleClose(); onLogout(); }} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ py: 3 }}>
        {children}
      </Container>

      {/* 💡 PASSWORD CHANGE DIALOG (MODAL) */}
      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} PaperProps={{ sx: { borderRadius: 4, padding: 1, minWidth: '350px' } }}>
        <DialogTitle sx={{ fontWeight: '900', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKey /> Change Password
        </DialogTitle>
        <DialogContent>
          {message && <Alert severity={message.type} sx={{ mt: 1, mb: 2 }}>{message.text}</Alert>}
          <TextField 
            fullWidth label="New Password" type="password" sx={{ mt: 2, mb: 2 }} variant="outlined"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
          />
          <TextField 
            fullWidth label="Confirm New Password" type="password" sx={{ mb: 1 }} variant="outlined"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setPasswordOpen(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={loading} sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}>
            {loading ? "Saving..." : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Layout;