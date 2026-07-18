import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, CardContent, Grid, Button, TextField, 
  Alert, Tabs, Tab, Box, Table, TableBody, TableCell, 
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle 
} from '@mui/material';
import axios from 'axios';

// --- SUB-COMPONENT: Manages the actual Database Tables ---
function UserDatabaseManager({ role }) {
  const [users, setUsers] = useState([]);
  const [newAcc, setNewAcc] = useState({ username: '', password: '', role: role });
  const [msg, setMsg] = useState(null);
  
  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState({ id: '', username: '', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/users/${role}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  // Create User
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/create-user', newAcc);
      setMsg({ type: 'success', text: response.data.message });
      setNewAcc({ username: '', password: '', role: role });
      fetchUsers(); // Refresh table
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || "Error creating account" });
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:8080/api/auth/users/${id}`);
        fetchUsers(); // Refresh table
      } catch (err) {
        alert("Failed to delete user.");
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setEditUser({ id: user.id, username: user.username, password: '' }); // Leave password blank unless changing
    setEditOpen(true);
  };

  // Save Edits
  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/auth/users/${editUser.id}`, editUser);
      setEditOpen(false);
      fetchUsers(); // Refresh table
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  return (
    <Box>
      {/* Create User Form */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">Create New {role}</Typography>
          {msg && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <TextField label="Username" variant="outlined" size="small" required
              value={newAcc.username} onChange={(e) => setNewAcc({...newAcc, username: e.target.value})} />
            <TextField label="Password" type="password" variant="outlined" size="small" required
              value={newAcc.password} onChange={(e) => setNewAcc({...newAcc, password: e.target.value})} />
            <Button type="submit" variant="contained" color="primary">Add {role}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center">No {role}s found.</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell align="right">
                    <Button color="secondary" onClick={() => openEditModal(user)}>Edit</Button>
                    <Button color="error" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit {role}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" sx={{ mt: 2, mb: 2 }}
            value={editUser.username} onChange={(e) => setEditUser({...editUser, username: e.target.value})} />
          <TextField fullWidth label="New Password (Leave blank to keep current)" type="password"
            value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- MAIN COMPONENT: Admin Dashboard ---
function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState({ totalStudents: 0, overallPlacementRate: '0%' });

  useEffect(() => {
    // Fetch overview stats only when component loads
    axios.get('http://localhost:8080/api/dashboard/admin')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom fontWeight="bold">Admin Control Center</Typography>
      
      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)}>
          <Tab label="System Overview" />
          <Tab label="Teacher Database" />
          <Tab label="Student Database" />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="h6">Total Assessed Records</Typography>
              <Typography variant="h3" color="primary">{stats.totalStudents}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="h6">Overall Placement</Typography>
              <Typography variant="h3" color="success.main">{stats.overallPlacementRate}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Teacher Management */}
      {tabIndex === 1 && <UserDatabaseManager role="Teacher" />}

      {/* Tab 2: Student Management */}
      {tabIndex === 2 && <UserDatabaseManager role="Student" />}
      
    </div>
  );
}

export default AdminDashboard;