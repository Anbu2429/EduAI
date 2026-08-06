import React, { useState, useEffect } from "react";
import {
  Typography, Card, CardContent, Grid, Button, TextField, 
  Alert, Tabs, Tab, Box, Table, TableBody, TableCell, 
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Stack,
  Paper, IconButton, Tooltip, Avatar, Chip, MenuItem, Select,
  FormControl, InputLabel, ToggleButton, ToggleButtonGroup, CircularProgress, Divider, List, ListItem, ListItemAvatar, ListItemText, Checkbox
} from '@mui/material';
import {
  UploadFile, Download, Dashboard as DashboardIcon, 
  School, People, GroupAdd, Edit as EditIcon, 
  Delete as DeleteIcon, PersonAdd, TrendingUp, Assessment, Quiz,
  AutoAwesome, EditNote, AddCircle, Delete, Visibility,
  Class as ClassIcon, Search, FilterList
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';

axios.defaults.withCredentials = true;

// Shared College Departments Constant
const COLLEGE_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Mechanical Engineering",
  "Electrical & Electronics Engineering",
  "Civil Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Business Administration",
  "Bachelor of Commerce (B.Com)",
  "Bachelor of Arts (English)"
];

// Helper to determine available years based on department type
const getYearsForDept = (dept) => {
  if (!dept) return [];
  const isEngineering = dept.includes("Engineering") || dept.includes("Technology") || dept.includes("Science");
  return isEngineering ? ["1st Year", "2nd Year", "3rd Year", "4th Year"] : ["1st Year", "2nd Year", "3rd Year"];
};

// --- SUB-COMPONENT 1: Bulk User Upload ---
function BulkUserUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastLog, setLastLog] = useState(null);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  const handleDownloadSample = () => {
    // Note: Password column is removed! The backend will auto-generate it.
    const sampleData = [
      { Role: "Teacher", Username: "faculty01@skct.edu.in", Department: "Computer Science & Engineering", Year: "All", ClassSection: "All" },
      { Role: "Student", Username: "student01@skct.edu.in", Department: "Computer Science & Engineering", Year: "2nd Year", ClassSection: "A" }
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
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const logData = response.data.data;
      setLastLog(logData);
      
      const successCount = logData.filter(log => log.status === 'Success').length;
      const failCount = logData.filter(log => log.status.includes('Failed')).length;

      if (logData && logData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(logData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Credentials Log");
        XLSX.writeFile(wb, "EduAI_Generated_Credentials.xlsx");
      }
      
      alert(`Bulk Upload Complete!\n\nSuccessfully Saved to Database: ${successCount}\nFailed to Save: ${failCount}\n\nThe credentials file has been auto-downloaded.`);
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
        <Typography variant="h5" fontWeight="bold">Intelligent Department Bulk Import</Typography>
      </Box>
      <CardContent sx={{ p: 5 }}>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4, fontSize: '1.1rem' }}>
          Upload your Excel registry. The system will auto-route students to their respective Departments, Academic Years, and Class Sections.
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
            Initialize Department Routing & Upload
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

// --- SUB-COMPONENT 2: Manages Database Tables with Smart Search, Filters & Bulk Delete ---
function UserDatabaseManager({ role }) {
  const [users, setUsers] = useState([]);
  const [newAcc, setNewAcc] = useState({ username: '', password: '', role: role, department: '', year: '', classSection: '' });
  const [msg, setMsg] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState({ id: '', username: '', password: '', department: '', year: '', classSection: '' });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // Bulk Delete Selection State
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/users/${role}`);
      setUsers(res.data);
    } catch (err) { console.error("Failed to fetch users", err); }
  };

  useEffect(() => { 
    fetchUsers(); 
    setSelectedUsers([]); // Reset selection when role changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/create-user', newAcc);
      setMsg({ type: 'success', text: response.data.message });
      setNewAcc({ username: '', password: '', role: role, department: '', year: '', classSection: '' });
      fetchUsers(); 
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || "Error creating account" });
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm(`Permanently delete this ${role}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/auth/users/${id}`);
        fetchUsers(); 
        setSelectedUsers(selectedUsers.filter(uId => uId !== id)); // Remove from selection if deleted
      } catch (err) { alert("Failed to delete user."); }
    }
  };

  const openEditModal = (user) => {
    setEditUser({ id: user.id, username: user.username, password: user.password || '', department: user.department || '', year: user.year || '', classSection: user.classSection || '' }); 
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/auth/users/${editUser.id}`, editUser);
      setEditOpen(false);
      fetchUsers(); 
    } catch (err) { alert("Failed to update user."); }
  };

  // --- FILTER LOGIC ---
  const availableFilterYears = [...new Set(users.filter(u => filterDept ? u.department === filterDept : true).map(u => u.year).filter(Boolean))].sort();
  const availableFilterClasses = [...new Set(users.filter(u => 
    (filterDept ? u.department === filterDept : true) && 
    (filterYear ? u.year === filterYear : true)
  ).map(u => u.classSection).filter(Boolean))].sort();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept ? user.department === filterDept : true;
    const matchesYear = filterYear ? user.year === filterYear : true;
    const matchesClass = filterClass ? user.classSection === filterClass : true;
    return matchesSearch && matchesDept && matchesYear && matchesClass;
  });

  // --- BULK DELETE LOGIC ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id)); // Select all currently visible users
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete the ${selectedUsers.length} selected ${role}(s)?`)) {
      try {
        // Send a delete request for every selected ID
        await Promise.all(selectedUsers.map(id => axios.delete(`http://localhost:8080/api/auth/users/${id}`)));
        setSelectedUsers([]);
        fetchUsers();
        alert(`Successfully deleted ${selectedUsers.length} users.`);
      } catch (err) {
        alert("Error deleting some users. They may have already been removed.");
        fetchUsers();
      }
    }
  };

  return (
    <Box>
      <Card elevation={4} sx={{ mb: 4, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <PersonAdd fontSize="large" /> Register New {role}
          </Typography>
          {msg && <Alert severity={msg.type} sx={{ mb: 3, borderRadius: 2 }}>{msg.text}</Alert>}
          <form onSubmit={handleCreate}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <TextField fullWidth label={`${role} Username`} variant="outlined" required size="small"
                  value={newAcc.username} onChange={(e) => setNewAcc({...newAcc, username: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Password" type="password" variant="outlined" required size="small"
                  value={newAcc.password} onChange={(e) => setNewAcc({...newAcc, password: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={newAcc.department} label="Department" onChange={(e) => setNewAcc({...newAcc, department: e.target.value, year: ''})}>
                    {COLLEGE_DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth required size="small" disabled={!newAcc.department}>
                  <InputLabel>Year</InputLabel>
                  <Select value={newAcc.year} label="Year" onChange={(e) => setNewAcc({...newAcc, year: e.target.value})}>
                    {getYearsForDept(newAcc.department).map(yr => <MenuItem key={yr} value={yr}>{yr}</MenuItem>)}
                    {role === 'Teacher' && <MenuItem value="All Years">All Years</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth label={role === 'Teacher' ? "Classes Managed" : "Section"} variant="outlined" size="small" placeholder="e.g., Section A" required
                  value={newAcc.classSection} onChange={(e) => setNewAcc({...newAcc, classSection: e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ py: 1.5, mt: 1, borderRadius: 3, fontWeight: 'bold' }}>
                  Create Account & Assign Routing
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* --- SMART SEARCH & FILTER BAR --- */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f0f4f8' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList /> Directory Search & Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField 
              fullWidth size="small" label="Search by Username..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <Search color="action" sx={{mr: 1}} /> }}
              sx={{ bgcolor: '#fff', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" sx={{ bgcolor: '#fff', borderRadius: 1 }}>
              <InputLabel>Filter by Department</InputLabel>
              <Select value={filterDept} label="Filter by Department" onChange={(e) => { setFilterDept(e.target.value); setFilterYear(''); setFilterClass(''); }}>
                <MenuItem value=""><em>All Departments</em></MenuItem>
                {COLLEGE_DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small" disabled={!filterDept} sx={{ bgcolor: filterDept ? '#fff' : 'transparent', borderRadius: 1 }}>
              <InputLabel>Filter by Year</InputLabel>
              <Select value={filterYear} label="Filter by Year" onChange={(e) => { setFilterYear(e.target.value); setFilterClass(''); }}>
                <MenuItem value=""><em>All Years</em></MenuItem>
                {availableFilterYears.map(yr => <MenuItem key={yr} value={yr}>{yr}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small" disabled={!filterYear} sx={{ bgcolor: filterYear ? '#fff' : 'transparent', borderRadius: 1 }}>
              <InputLabel>Filter by Section</InputLabel>
              <Select value={filterClass} label="Filter by Section" onChange={(e) => setFilterClass(e.target.value)}>
                <MenuItem value=""><em>All Sections</em></MenuItem>
                {availableFilterClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth variant="outlined" color="secondary" 
              onClick={() => {setSearchQuery(''); setFilterDept(''); setFilterYear(''); setFilterClass('');}}
              sx={{ py: 1, fontWeight: 'bold' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- TABLE DISPLAY WITH BULK DELETE --- */}
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        
        {/* Bulk Delete Header Actions */}
        <Box sx={{ bgcolor: '#e3f2fd', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            {filteredUsers.length} {role}(s) Found
          </Typography>
          {selectedUsers.length > 0 && (
            <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleBulkDelete} sx={{ fontWeight: 'bold' }}>
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
        </Box>

        <Table>
          <TableHead sx={{ background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox 
                  sx={{ color: 'white', '&.Mui-checked': { color: '#64b5f6' } }}
                  onChange={handleSelectAll} 
                  checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Password</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Year & Section</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id} hover sx={{ transition: '0.2s', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.05)' } }}>
                <TableCell padding="checkbox">
                  <Checkbox 
                    checked={selectedUsers.includes(user.id)} 
                    onChange={(e) => handleSelectOne(e, user.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: role === 'Teacher' ? '#9c27b0' : '#1976d2' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold">{user.username}</Typography>
                      <Typography variant="caption" color="text.secondary">ID: #{user.id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#d32f2f', fontWeight: 'bold' }}>{user.password}</TableCell>
                <TableCell><Chip label={user.department || 'Unassigned'} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="text.secondary">
                    {user.year ? `${user.year} - ` : ''}{user.classSection || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Profile & Routing">
                    <IconButton color="primary" onClick={() => openEditModal(user)} sx={{ mr: 1 }}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Account">
                    <IconButton color="error" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="subtitle1" color="text.secondary">No matching {role}s found for these filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* --- EDIT MODAL --- */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: 4, padding: 3, minWidth: '500px' } }}>
        <DialogTitle sx={{ fontWeight: '900', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, px: 0 }}>
          <EditIcon /> Edit Routing Credentials
        </DialogTitle>
        <DialogContent sx={{ px: 0, mt: 2 }}>
          <Stack spacing={3}>
            <TextField fullWidth label="Username" variant="outlined" value={editUser.username} onChange={(e) => setEditUser({...editUser, username: e.target.value})} />
            <TextField fullWidth label="Password" type="text" variant="outlined" value={editUser.password} onChange={(e) => setEditUser({...editUser, password: e.target.value})} />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={editUser.department} label="Department" onChange={(e) => setEditUser({...editUser, department: e.target.value, year: ''})}>
                {COLLEGE_DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!editUser.department}>
              <InputLabel>Academic Year</InputLabel>
              <Select value={editUser.year} label="Academic Year" onChange={(e) => setEditUser({...editUser, year: e.target.value})}>
                {getYearsForDept(editUser.department).map(yr => <MenuItem key={yr} value={yr}>{yr}</MenuItem>)}
                {role === 'Teacher' && <MenuItem value="All Years">All Years</MenuItem>}
              </Select>
            </FormControl>
            <TextField fullWidth label="Class / Section" variant="outlined" value={editUser.classSection} onChange={(e) => setEditUser({...editUser, classSection: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ pb: 0, px: 0, mt: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}>Save Routing Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// --- SUB-COMPONENT 3: Class Roster & Teacher Assignment Manager ---
function ClassRosterManager() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  const [classAssignments, setClassAssignments] = useState({});

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8080/api/auth/users/Student'),
      axios.get('http://localhost:8080/api/auth/users/Teacher')
    ]).then(([studentRes, teacherRes]) => {
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
    }).catch(err => console.error(err));
  }, []);

  const availableYears = [...new Set(students.filter(s => s.department === selectedDept).map(s => s.year).filter(Boolean))].sort();
  const availableClasses = [...new Set(students.filter(s => s.department === selectedDept && s.year === selectedYear).map(s => s.classSection).filter(Boolean))].sort();
  
  const classRoster = students.filter(s => s.department === selectedDept && s.year === selectedYear && s.classSection === selectedClass);
  const currentAssignedTeacherId = classAssignments[`${selectedDept}-${selectedYear}-${selectedClass}`] || '';

  const handleAssignTeacher = (teacherId) => {
    setClassAssignments(prev => ({ ...prev, [`${selectedDept}-${selectedYear}-${selectedClass}`]: teacherId }));
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 4, p: 4, minHeight: '600px' }}>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ClassIcon fontSize="large" /> Roster & Attendance Setup
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select a department, academic year, and section to view the student roster. Assign a teacher to this specific class so it appears in their portal for daily attendance marking.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>1. Select Department</InputLabel>
            <Select value={selectedDept} label="1. Select Department" onChange={(e) => { setSelectedDept(e.target.value); setSelectedYear(''); setSelectedClass(''); }}>
              {COLLEGE_DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled={!selectedDept || availableYears.length === 0}>
            <InputLabel>2. Select Year</InputLabel>
            <Select value={selectedYear} label="2. Select Year" onChange={(e) => { setSelectedYear(e.target.value); setSelectedClass(''); }}>
              {availableYears.map(yr => <MenuItem key={yr} value={yr}>{yr}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled={!selectedYear || availableClasses.length === 0}>
            <InputLabel>3. Select Section</InputLabel>
            <Select value={selectedClass} label="3. Select Section" onChange={(e) => setSelectedClass(e.target.value)}>
              {availableClasses.map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedDept && selectedYear && selectedClass && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '2px solid #eee' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">Class Roster: {selectedClass}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={selectedDept} size="small" color="primary" />
                <Chip label={selectedYear} size="small" color="secondary" />
              </Box>
            </Box>
            
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom display="block">Assign Teacher for Attendance:</Typography>
              <FormControl fullWidth size="small">
                <Select 
                  value={currentAssignedTeacherId} 
                  displayEmpty
                  onChange={(e) => handleAssignTeacher(e.target.value)}
                  sx={{ bgcolor: '#fff', fontWeight: 'bold' }}
                >
                  <MenuItem value="" disabled><em>Select a Teacher...</em></MenuItem>
                  {teachers.filter(t => t.department === selectedDept || !t.department).map(t => (
                    <MenuItem key={t.id} value={t.id}>Prof. {t.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="secondary" /> Students Enrolled ({classRoster.length})
          </Typography>
          
          <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #eee', maxHeight: 400, overflow: 'auto' }}>
            {classRoster.length > 0 ? classRoster.map((student) => (
              <React.Fragment key={student.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>{student.username.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={<Typography fontWeight="bold">{student.username}</Typography>} secondary={`Student ID: #${student.id}`} />
                  <Chip label="Enrolled" color="success" size="small" variant="outlined" />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            )) : (
              <ListItem><ListItemText primary="No students found in this class." /></ListItem>
            )}
          </List>
        </Paper>
      )}
    </Card>
  );
}

// --- SUB-COMPONENT 4: Admin Assessment & Quiz Creator ---
function AdminAssessmentManager() {
  const [viewMode, setViewMode] = useState('list'); 
  const [creationMode, setCreationMode] = useState('manual'); 
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState('APTITUDE');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [questions, setQuestions] = useState([
    { text: '', category: 'Quantitative Aptitude', type: 'MCQ', options: ['', '', '', ''], answer: '', testCaseInput: '', expectedOutput: '', starterCode: { java: '', cpp: '', python: '' } }
  ]);
  const [autoConfig, setAutoConfig] = useState({ category: 'Quantitative Aptitude', difficulty: 'Medium', count: 5 });
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msgText, setMsgText] = useState('Assessment successfully published!');
  const [publishedTests, setPublishedTests] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => { if (viewMode === 'list') fetchPublishedTests(); }, [viewMode]);

  const fetchPublishedTests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/assessments');
      setPublishedTests(res.data);
    } catch (err) { console.error("Failed to fetch assessments", err); }
  };

  const deleteAssessment = async (id) => {
    if(window.confirm("Delete this assessment?")) {
      await axios.delete(`http://localhost:8080/api/assessments/${id}`);
      fetchPublishedTests(); 
    }
  };

  const handleOpenView = (test) => { setSelectedAssessment(test); setViewDialogOpen(true); };
  const handleCloseView = () => { setViewDialogOpen(false); setSelectedAssessment(null); };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType === 'APTITUDE') {
      setAutoConfig(prev => ({ ...prev, category: 'Quantitative Aptitude' }));
      setQuestions(questions.map(q => ({ ...q, category: 'Quantitative Aptitude', type: 'MCQ' })));
    } else {
      setAutoConfig(prev => ({ ...prev, category: 'Arrays & Strings' }));
      setQuestions(questions.map(q => ({ ...q, category: 'Arrays & Strings', type: 'CODING' })));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addQuestionField = () => {
    setQuestions([...questions, { text: '', category: type === 'APTITUDE' ? 'Quantitative Aptitude' : 'Arrays & Strings', type: type === 'APTITUDE' ? 'MCQ' : 'CODING', options: ['', '', '', ''], answer: '', testCaseInput: '', expectedOutput: '', starterCode: { java: '', cpp: '', python: '' } }]);
  };

  const removeQuestionField = (index) => { setQuestions(questions.filter((_, i) => i !== index)); };

  const finalizeSave = () => {
    setSuccess(true);
    setTitle('');
    setQuestions([{ text: '', category: type === 'APTITUDE' ? 'Quantitative Aptitude' : 'Arrays & Strings', type: type === 'APTITUDE' ? 'MCQ' : 'CODING', options: ['', '', '', ''], answer: '', testCaseInput: '', expectedOutput: '', starterCode: { java: '', cpp: '', python: '' } }]);
    setTimeout(() => { setSuccess(false); setViewMode('list'); }, 2000);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/assessments/create', { title, type, durationMinutes, questions });
      setMsgText('Manual Assessment successfully published!');
      finalizeSave();
    } catch (err) { alert("Error saving assessment."); }
  };

  const handleAutoGenerate = async () => {
    if (!title) return alert("Please enter an Assessment Title first.");
    setLoadingAuto(true);
    try {
      const generatedQuestions = [];
      const codingProblems = [
        { text: "Write an optimal function to reverse a string.", input: "\"hello\"", output: "\"olleh\"" },
        { text: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.", input: "[2,7,11,15], target = 9", output: "[0,1]" },
        { text: "Check whether a given number is a palindrome.", input: "121", output: "true" },
        { text: "Find the factorial of a given positive integer N.", input: "5", output: "120" },
        { text: "Find the nth Fibonacci number.", input: "6", output: "8" }
      ];

      for (let i = 1; i <= autoConfig.count; i++) {
        if (type === 'APTITUDE') {
          generatedQuestions.push({
            text: `[${autoConfig.category} - ${autoConfig.difficulty}] Question #${i}: What is the correct logical deduction or numerical solution?`,
            category: autoConfig.category, type: 'MCQ', options: ['A) Option Alpha', 'B) Option Beta', 'C) Option Gamma', 'D) Option Delta'], answer: 'A', testCaseInput: '', expectedOutput: '', starterCode: { java: '', cpp: '', python: '' }
          });
        } else {
          const prob = codingProblems[(i - 1) % codingProblems.length];
          generatedQuestions.push({
            text: `[${autoConfig.category} - ${autoConfig.difficulty}] Problem #${i}: ${prob.text}`,
            category: autoConfig.category, type: 'CODING', options: [], answer: '',
            testCaseInput: prob.input, expectedOutput: prob.output,
            starterCode: {
              java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}`,
              cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`,
              python: `def solve():\n    # Write your code here\n    pass`
            }
          });
        }
      }
      await axios.post('http://localhost:8080/api/assessments/create', { title, type, durationMinutes: autoConfig.count * 4, questions: generatedQuestions });
      setMsgText(`Successfully Auto-Generated and Published ${autoConfig.count} Questions!`);
      finalizeSave();
    } catch (err) { alert("Failed to auto-generate."); } finally { setLoadingAuto(false); }
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 4, p: 4, maxWidth: 950, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, borderBottom: '2px solid #f0f0f0', pb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Quiz fontSize="large" /> Assessment Studio</Typography>
        <ToggleButtonGroup value={viewMode} exclusive onChange={(e, newMode) => newMode && setViewMode(newMode)} color="primary" size="medium">
          <ToggleButton value="build" sx={{ fontWeight: 'bold', px: 3 }}>Build New Test</ToggleButton>
          <ToggleButton value="list" sx={{ fontWeight: 'bold', px: 3 }}>View Published Tests</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{msgText}</Alert>}

      {viewMode === 'list' && (
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Live Assessments in Database</Typography>
          {publishedTests.length === 0 ? <Alert severity="info">No assessments published yet.</Alert> : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell fontWeight="bold">ID</TableCell><TableCell fontWeight="bold">Title</TableCell><TableCell fontWeight="bold">Type</TableCell><TableCell fontWeight="bold">Questions</TableCell><TableCell align="right" fontWeight="bold">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishedTests.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>#{test.id}</TableCell><TableCell sx={{ fontWeight: 'bold' }}>{test.title}</TableCell><TableCell><Chip label={test.type} color={test.type === 'CODING' ? 'secondary' : 'primary'} size="small" /></TableCell><TableCell>{test.questions?.length || 0} Qs</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details"><IconButton color="primary" onClick={() => handleOpenView(test)}><Visibility /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton color="error" onClick={() => deleteAssessment(test.id)}><Delete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Dialog open={viewDialogOpen} onClose={handleCloseView} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">{selectedAssessment?.title}</Typography>
              <Chip label={selectedAssessment?.type} color={selectedAssessment?.type === 'CODING' ? 'secondary' : 'primary'} />
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              {selectedAssessment?.questions?.map((q, idx) => (
                <Paper key={idx} elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>Question #{idx + 1} &nbsp;<Chip label={q.category} size="small" variant="outlined" /></Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap', fontWeight: 500 }}>{q.text}</Typography>
                  {q.type === 'MCQ' ? (
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">Correct Answer: {q.answer}</Typography>
                  ) : (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="secondary.main">Test Case Input: {q.testCaseInput}</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>Expected Output: {q.expectedOutput}</Typography>
                      <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace', fontSize: '0.9rem', overflowX: 'auto', borderRadius: 2 }}>
                        {q.starterCode?.java || "No starter code provided."}
                      </Paper>
                    </Box>
                  )}
                </Paper>
              ))}
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}><Button onClick={handleCloseView} variant="contained">Close Viewer</Button></DialogActions>
          </Dialog>
        </Box>
      )}

      {viewMode === 'build' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <ToggleButtonGroup value={creationMode} exclusive onChange={(e, newMode) => newMode && setCreationMode(newMode)} size="small" color="secondary">
              <ToggleButton value="manual" sx={{ fontWeight: 'bold' }}><EditNote sx={{ mr: 1 }} /> Manual Add</ToggleButton>
              <ToggleButton value="auto" sx={{ fontWeight: 'bold' }}><AutoAwesome sx={{ mr: 1 }} /> Auto / AI Generate</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Stack spacing={3} sx={{ mb: 4 }}>
            <TextField label="Assessment Title" fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="domain-label">Assessment Domain</InputLabel>
                  <Select labelId="domain-label" value={type} label="Assessment Domain" onChange={handleTypeChange}>
                    <MenuItem value="APTITUDE">Aptitude, Logical & Verbal Reasoning</MenuItem>
                    <MenuItem value="CODING">Data Structures & Algorithms (Coding)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}><TextField label="Duration (Minutes)" type="number" fullWidth required value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} /></Grid>
            </Grid>
          </Stack>

          {creationMode === 'auto' ? (
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: '#f0f4f8', border: '1px dashed #1976d2' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom><AutoAwesome /> Automated Question Bank Generator</Typography>
              <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="auto-cat-label">Category / Topic</InputLabel>
                    <Select labelId="auto-cat-label" value={autoConfig.category} label="Category / Topic" onChange={(e) => setAutoConfig({...autoConfig, category: e.target.value})}>
                      {type === 'APTITUDE' ? (
                        [ <MenuItem key="1" value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>, <MenuItem key="2" value="Logical Reasoning">Logical Reasoning</MenuItem> ]
                      ) : (
                        [ <MenuItem key="6" value="Arrays & Strings">Arrays & Strings</MenuItem>, <MenuItem key="7" value="Linked Lists">Linked Lists</MenuItem> ]
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select value={autoConfig.difficulty} label="Difficulty Level" onChange={(e) => setAutoConfig({...autoConfig, difficulty: e.target.value})}>
                      <MenuItem value="Easy">Easy (Service-based)</MenuItem><MenuItem value="Medium">Medium (Product-based)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}><TextField label="Number of Questions" type="number" fullWidth inputProps={{ min: 1, max: 25 }} value={autoConfig.count} onChange={(e) => setAutoConfig({...autoConfig, count: Number(e.target.value)})} /></Grid>
              </Grid>
              <Button variant="contained" size="large" fullWidth onClick={handleAutoGenerate} disabled={loadingAuto} sx={{ py: 1.8, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 3 }} startIcon={<AutoAwesome />}>
                {loadingAuto ? <CircularProgress size={24} color="inherit" /> : `Auto-Generate & Publish ${autoConfig.count} Questions`}
              </Button>
            </Paper>
          ) : (
            <form onSubmit={handleSaveAssessment}>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight="bold">Manual Question Builder</Typography>
                {questions.map((q, qIndex) => (
                  <Paper key={qIndex} elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">Question #{qIndex + 1}</Typography>
                      {questions.length > 1 && (<Button color="error" size="small" onClick={() => removeQuestionField(qIndex)}>Remove</Button>)}
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Sub-Category</InputLabel>
                          <Select value={q.category} label="Sub-Category" onChange={(e) => handleQuestionChange(qIndex, 'category', e.target.value)}>
                            {type === 'APTITUDE' ? (
                              [ <MenuItem key="m1" value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>, <MenuItem key="m2" value="Logical Reasoning">Logical Reasoning</MenuItem> ]
                            ) : (
                              [ <MenuItem key="c1" value="Arrays & Strings">Arrays & Strings</MenuItem>, <MenuItem key="c2" value="Linked Lists">Linked Lists</MenuItem> ]
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <TextField label="Problem Description" fullWidth required multiline rows={2} value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} sx={{ mb: 2 }} />
                    {type === 'APTITUDE' ? (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {q.options.map((opt, oIndex) => (<Grid item xs={12} sm={6} key={oIndex}><TextField label={`Option ${String.fromCharCode(65 + oIndex)}`} fullWidth size="small" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} /></Grid>))}
                        </Grid>
                        <TextField label="Correct Answer Letter (e.g., A)" fullWidth size="small" value={q.answer} onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} />
                      </Box>
                    ) : (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} md={6}><TextField label="Test Case Input (e.g., [1,2,3])" fullWidth size="small" required value={q.testCaseInput} onChange={(e) => handleQuestionChange(qIndex, 'testCaseInput', e.target.value)} /></Grid>
                          <Grid item xs={12} md={6}><TextField label="Expected Output (e.g., 6)" fullWidth size="small" required value={q.expectedOutput} onChange={(e) => handleQuestionChange(qIndex, 'expectedOutput', e.target.value)} /></Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}><TextField label="C++" fullWidth multiline rows={3} value={q.starterCode?.cpp || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, cpp: e.target.value })} /></Grid>
                          <Grid item xs={12} md={4}><TextField label="Java" fullWidth multiline rows={3} value={q.starterCode?.java || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, java: e.target.value })} /></Grid>
                          <Grid item xs={12} md={4}><TextField label="Python" fullWidth multiline rows={3} value={q.starterCode?.python || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, python: e.target.value })} /></Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                ))}
                <Button variant="outlined" startIcon={<AddCircle />} onClick={addQuestionField} sx={{ py: 1.5, fontWeight: 'bold' }}>Add Another Question</Button>
                <Button type="submit" variant="contained" size="large" sx={{ py: 1.8, borderRadius: 3, fontWeight: 'bold' }}>Publish Manual Assessment</Button>
              </Stack>
            </form>
          )}
        </Box>
      )}
    </Card>
  );
}

// --- MAIN COMPONENT: Admin Dashboard ---
function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [stats, setStats] = useState({ totalStudents: 0, overallPlacementRate: '0%' });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/dashboard/admin').then(res => setStats(res.data)).catch(err => console.error(err));
    
    Promise.all([
      axios.get('http://localhost:8080/api/auth/users/Teacher'),
      axios.get('http://localhost:8080/api/auth/users/Student')
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
                Manage system users, routing logistics, publish assessments, and control global settings.
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
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { height: 4, borderRadius: 2 } }}
            sx={{ '& .MuiTab-root': { fontWeight: '900', fontSize: '1.05rem', textTransform: 'none', py: 3 } }}
          >
            <Tab icon={<Assessment />} iconPosition="start" label="System Overview" />
            <Tab icon={<School />} iconPosition="start" label="Teacher Directory" />
            <Tab icon={<People />} iconPosition="start" label="Student Directory" />
            <Tab icon={<ClassIcon />} iconPosition="start" label="Class & Roster Setup" />
            <Tab icon={<Quiz />} iconPosition="start" label="Manage Assessments" />
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
        {tabIndex === 3 && <ClassRosterManager />}
        {tabIndex === 4 && <AdminAssessmentManager />}
        {tabIndex === 5 && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={8}><BulkUserUpload /></Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;