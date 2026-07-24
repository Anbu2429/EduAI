import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, CardContent, Grid, Button, TextField, 
  Alert, Tabs, Tab, Box, Table, TableBody, TableCell, 
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Stack,
  Paper, IconButton, Tooltip, Avatar, Chip
} from '@mui/material';
import {
  UploadFile, Download, Dashboard as DashboardIcon, 
  School, People, GroupAdd, Edit as EditIcon, 
  Delete as DeleteIcon, PersonAdd, TrendingUp, Assessment
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';

// --- SUB-COMPONENT 1: Bulk User Upload ---
function BulkUserUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastLog, setLastLog] = useState(null);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  const handleDownloadSample = () => {
    const sampleData = [
      { Role: "Teacher", Username: "prof_smith", Password: "" },
      { Role: "Student", Username: "student_101", Password: "customPassword123" }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "EduAI_Bulk_Upload_Template.xlsx");
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an Excel file.");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true // Ensure admin session is passed
      });
      
      const logData = response.data.data;
      setLastLog(logData);
      
      // Calculate Success vs Failure
      const successCount = logData.filter(log => log.status === 'Success').length;
      const failCount = logData.filter(log => log.status.includes('Failed')).length;

      if (logData && logData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(logData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Credentials Log");
        XLSX.writeFile(wb, "EduAI_Generated_Credentials.xlsx");
      }
      
      // Detailed Alert Box
      alert(`Bulk Upload Complete!\n\nSuccessfully Saved to Database: ${successCount}\nFailed to Save: ${failCount}\n\nThe credentials file has been auto-downloaded. Check the 'status' column in the Excel file for details.`);
      setSelectedFile(null);
    } catch (err) {
      alert(err.response?.data?.error || "Error uploading file. Check console.");
    }
  };

  const handleDownloadLog = () => {
    if (!lastLog) return;
    const ws = XLSX.utils.json_to_sheet(lastLog);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Credentials Log");
    XLSX.writeFile(wb, "EduAI_Generated_Credentials.xlsx");
  };

  return (
    <Card elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', color: 'white', p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold">Intelligent Bulk Import</Typography>
      </Box>
      <CardContent sx={{ p: 5 }}>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4, fontSize: '1.1rem' }}>
          Upload your Excel registry. Our system will auto-generate secure credentials for any blank passwords, store them in the database, and instantly download the delivery log.
        </Typography>
        <Stack spacing={4}>
          <Box component="label" sx={{ 
            border: '3px dashed', borderColor: 'primary.light', borderRadius: 4, p: 6, textAlign: 'center',
            bgcolor: 'rgba(25, 118, 210, 0.03)', cursor: 'pointer', transition: 'all 0.3s',
            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)', transform: 'scale(1.02)' }
          }}>
            <UploadFile sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" color="primary" fontWeight="bold">
              {selectedFile ? selectedFile.name : "Drag & Drop or Click to Browse .xlsx"}
            </Typography>
            <input hidden type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
          </Box>
          <Button variant="contained" size="large" onClick={handleUpload} disabled={!selectedFile}
            sx={{ borderRadius: 3, py: 2, fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)' }}>
            Initialize Secure Upload
          </Button>
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Button variant="outlined" startIcon={<Download />} fullWidth sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }} onClick={handleDownloadSample}>
              Get Excel Template
            </Button>
            <Button variant="contained" color="success" startIcon={<Download />} fullWidth sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold' }} onClick={handleDownloadLog} disabled={!lastLog}>
              Re-Download Last Log
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENT 2: Manages the actual Database Tables ---
function UserDatabaseManager({ role }) {
  const [users, setUsers] = useState([]);
  const [newAcc, setNewAcc] = useState({ username: '', password: '', role: role });
  const [msg, setMsg] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState({ id: '', username: '', password: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/users/${role}`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) { console.error("Failed to fetch users", err); }
  };

  useEffect(() => { 
    fetchUsers(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/create-user', newAcc, { withCredentials: true });
      setMsg({ type: 'success', text: response.data.message });
      setNewAcc({ username: '', password: '', role: role });
      fetchUsers(); 
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || "Error creating account" });
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm(`Permanently delete this ${role}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/auth/users/${id}`, { withCredentials: true });
        fetchUsers(); 
      } catch (err) { alert("Failed to delete user."); }
    }
  };

  const openEditModal = (user) => {
    // Passes the existing password so it is visible in the modal
    setEditUser({ id: user.id, username: user.username, password: user.password || '' }); 
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/auth/users/${editUser.id}`, editUser, { withCredentials: true });
      setEditOpen(false);
      fetchUsers(); 
    } catch (err) { alert("Failed to update user."); }
  };

  return (
    <Box>
      <Card elevation={4} sx={{ mb: 5, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonAdd fontSize="large" /> Register New {role}
          </Typography>
          {msg && <Alert severity={msg.type} sx={{ mb: 3, borderRadius: 2 }}>{msg.text}</Alert>}
          <form onSubmit={handleCreate}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth label={`${role} Username`} variant="outlined" required
                  value={newAcc.username} onChange={(e) => setNewAcc({...newAcc, username: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Secure Password" type="password" variant="outlined" required
                  value={newAcc.password} onChange={(e) => setNewAcc({...newAcc, password: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ py: 1.8, borderRadius: 3, fontWeight: 'bold' }}>
                  Create Account
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Account ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Username</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Password</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover sx={{ transition: '0.2s', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.05)' } }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '1.1rem' }}>#{user.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: role === 'Teacher' ? '#9c27b0' : '#1976d2' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography fontWeight="bold" fontSize="1.1rem">{user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#d32f2f', fontWeight: 'bold' }}>
                  {user.password}
                </TableCell>
                <TableCell><Chip label="Active" color="success" sx={{ fontWeight: 'bold' }} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Profile">
                    <IconButton color="primary" onClick={() => openEditModal(user)} sx={{ mr: 1 }}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Account">
                    <IconButton color="error" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: 4, padding: 2, minWidth: '400px' } }}>
        <DialogTitle sx={{ fontWeight: '900', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon /> Edit Credentials
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" sx={{ mt: 2, mb: 3 }} variant="outlined"
            value={editUser.username} onChange={(e) => setEditUser({...editUser, username: e.target.value})} />
          {/* Changed to text type so you can read the password while editing */}
          <TextField fullWidth label="Password" type="text" variant="outlined" 
            value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- MAIN COMPONENT: Admin Dashboard ---
function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState({ totalStudents: 0, overallPlacementRate: '0%' });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/dashboard/admin', { withCredentials: true }).then(res => setStats(res.data)).catch(err => console.error(err));
    
    Promise.all([
      axios.get('http://localhost:8080/api/auth/users/Teacher', { withCredentials: true }),
      axios.get('http://localhost:8080/api/auth/users/Student', { withCredentials: true })
    ]).then(([teacherRes, studentRes]) => {
      setChartData([
        { name: 'Teachers', count: teacherRes.data.length, color: '#9c27b0' }, 
        { name: 'Students', count: studentRes.data.length, color: '#1976d2' }  
      ]);
    }).catch(err => console.error(err));
  }, [tabIndex]); 

  return (
    <Box sx={{ bgcolor: '#f4f7fa', minHeight: '100vh', pt: 4, pb: 10 }}>
      <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, boxSizing: 'border-box' }}>
        
        <Box sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          mb: 5, p: 4, borderRadius: 4, 
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)', color: 'white',
          boxShadow: '0 10px 30px rgba(25, 118, 210, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <DashboardIcon sx={{ fontSize: 36, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="900" letterSpacing={1}>EduAI Admin Workspace</Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage system users, view analytics, and control global settings.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
             <Typography variant="h6" fontWeight="bold">System Administrator</Typography>
             <Chip label="Master Control Active" sx={{ mt: 1, fontWeight: 'bold', bgcolor: '#4caf50', color: 'white' }} />
          </Box>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 4, mb: 5, p: 1 }}>
          <Tabs 
            value={tabIndex} 
            onChange={(e, newIndex) => setTabIndex(newIndex)}
            variant="fullWidth"
            TabIndicatorProps={{ style: { height: 4, borderRadius: 2 } }}
            sx={{ '& .MuiTab-root': { fontWeight: '900', fontSize: '1.1rem', textTransform: 'none', py: 3 } }}
          >
            <Tab icon={<Assessment />} iconPosition="start" label="System Overview & Analytics" />
            <Tab icon={<School />} iconPosition="start" label="Teacher Directory" />
            <Tab icon={<People />} iconPosition="start" label="Student Directory" />
            <Tab icon={<GroupAdd />} iconPosition="start" label="Bulk Import Utility" />
          </Tabs>
        </Paper>

        {tabIndex === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', color: 'white', height: '100%' }}>
                <CardContent sx={{ p: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" sx={{ opacity: 0.9, mb: 1 }}>Total System Records</Typography>
                    <Typography variant="h1" fontWeight="900">{stats.totalStudents}</Typography>
                  </Box>
                  <People sx={{ fontSize: 100, opacity: 0.2 }} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={6} sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', height: '100%' }}>
                <CardContent sx={{ p: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" sx={{ opacity: 0.9, mb: 1 }}>Global Placement Rate</Typography>
                    <Typography variant="h1" fontWeight="900">{stats.overallPlacementRate}</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 100, opacity: 0.2 }} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={5} sx={{ borderRadius: 4, p: 3, height: 450 }}>
                <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom align="center">
                  User Demographics (Pie Chart)
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={5} sx={{ borderRadius: 4, p: 3, height: 450 }}>
                <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom align="center">
                  Account Distribution (Bar Chart)
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 16, fontWeight: 'bold' }} />
                    <YAxis />
                    <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabIndex === 1 && <UserDatabaseManager role="Teacher" />}
        {tabIndex === 2 && <UserDatabaseManager role="Student" />}
        {tabIndex === 3 && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={8}><BulkUserUpload /></Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;