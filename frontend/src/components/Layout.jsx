import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Avatar, Box, Container, Menu, MenuItem, Divider, IconButton } from '@mui/material';
import { Logout, School, Person, Home } from '@mui/icons-material'; // Ensure Home is imported

function Layout({ user, onLogout, children }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleGoHome = () => navigate('/');
  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  };

  if (!user) return <>{children}</>;

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="sticky" elevation={2} sx={{ background: 'rgba(255, 255, 255, 0.95)', color: '#333', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          {/* Ensure this IconButton block is present */}
          <IconButton 
            onClick={handleGoHome} 
            sx={{ mr: 2, color: '#1976d2' }}
            aria-label="home"
          >
            <Home />
          </IconButton>

          <School sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: '#1976d2' }}>
            EduAI Portal
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.username}</Typography>
            <Avatar 
              onClick={handleClick}
              sx={{ bgcolor: '#1976d2', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleProfileClick}><Person sx={{ mr: 1 }} /> My Profile</MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleClose(); onLogout(); }} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}

export default Layout;