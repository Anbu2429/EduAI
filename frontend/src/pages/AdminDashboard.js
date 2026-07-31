import React, { useState, useEffect } from "react";
import {
  Typography, Card, CardContent, Grid, Button, TextField, 
  Alert, Tabs, Tab, Box, Table, TableBody, TableCell, 
  TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Stack,
  Paper, IconButton, Tooltip, Avatar, Chip, MenuItem, Select,
  FormControl, InputLabel, ToggleButton, ToggleButtonGroup, CircularProgress, Divider
} from '@mui/material';
import {
  UploadFile, Download, Dashboard as DashboardIcon, 
  School, People, GroupAdd, Edit as EditIcon, 
  Delete as DeleteIcon, PersonAdd, TrendingUp, Assessment, Quiz,
  AutoAwesome, EditNote, AddCircle, Delete, Visibility
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';

axios.defaults.withCredentials = true;

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
        withCredentials: true 
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
      const res = await axios.get(`http://localhost:8080/api/auth/users/${role}`);
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
      const response = await axios.post('http://localhost:8080/api/auth/create-user', newAcc);
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
        await axios.delete(`http://localhost:8080/api/auth/users/${id}`);
        fetchUsers(); 
      } catch (err) { alert("Failed to delete user."); }
    }
  };

  const openEditModal = (user) => {
    setEditUser({ id: user.id, username: user.username, password: user.password || '' }); 
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:8080/api/auth/users/${editUser.id}`, editUser);
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

// --- SUB-COMPONENT 3: Admin Assessment & Quiz Creator ---
function AdminAssessmentManager() {
  const [viewMode, setViewMode] = useState('list'); // Default to list view
  const [creationMode, setCreationMode] = useState('manual'); 
  
  // Build State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('APTITUDE');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [questions, setQuestions] = useState([
    { text: '', category: 'Quantitative Aptitude', type: 'MCQ', options: ['', '', '', ''], answer: '', starterCode: { java: '', cpp: '', python: '' } }
  ]);
  const [autoConfig, setAutoConfig] = useState({ category: 'Quantitative Aptitude', difficulty: 'Medium', count: 5 });
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msgText, setMsgText] = useState('Assessment successfully published to database!');

  // List State & View Modal State
  const [publishedTests, setPublishedTests] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchPublishedTests();
    }
  }, [viewMode]);

  const fetchPublishedTests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/assessments');
      setPublishedTests(res.data);
    } catch (err) {
      console.error("Failed to fetch assessments", err);
    }
  };

  const deleteAssessment = async (id) => {
    if(window.confirm("Delete this assessment? It will be removed from all student portals.")) {
      try {
        await axios.delete(`http://localhost:8080/api/assessments/${id}`);
        fetchPublishedTests(); 
      } catch (err) {
        alert("Failed to delete assessment");
      }
    }
  };

  // --- VIEW ASSESSMENT HANDLERS ---
  const handleOpenView = (test) => {
    setSelectedAssessment(test);
    setViewDialogOpen(true);
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setSelectedAssessment(null);
  };

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
    setQuestions([...questions, { 
      text: '', 
      category: type === 'APTITUDE' ? 'Quantitative Aptitude' : 'Arrays & Strings', 
      type: type === 'APTITUDE' ? 'MCQ' : 'CODING', 
      options: ['', '', '', ''], 
      answer: '', 
      starterCode: { java: '', cpp: '', python: '' } 
    }]);
  };

  const removeQuestionField = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const finalizeSave = () => {
    setSuccess(true);
    setTitle('');
    setQuestions([{ text: '', category: type === 'APTITUDE' ? 'Quantitative Aptitude' : 'Arrays & Strings', type: type === 'APTITUDE' ? 'MCQ' : 'CODING', options: ['', '', '', ''], answer: '', starterCode: { java: '', cpp: '', python: '' } }]);
    setTimeout(() => {
      setSuccess(false);
      setViewMode('list'); 
    }, 2000);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, type, durationMinutes, questions };
      await axios.post('http://localhost:8080/api/assessments/create', payload);
      setMsgText('Manual Assessment successfully published to database!');
      finalizeSave();
    } catch (err) {
      console.error(err);
      alert("Error saving assessment to database.");
    }
  };

  const handleAutoGenerate = async () => {
    if (!title) return alert("Please enter an Assessment Title first.");
    setLoadingAuto(true);
    try {
      const generatedQuestions = [];
      for (let i = 1; i <= autoConfig.count; i++) {
        if (type === 'APTITUDE') {
          generatedQuestions.push({
            text: `[${autoConfig.category} - ${autoConfig.difficulty}] Question #${i}: What is the correct logical deduction or numerical solution?`,
            category: autoConfig.category, type: 'MCQ', options: ['A) Option Alpha', 'B) Option Beta', 'C) Option Gamma', 'D) Option Delta'], answer: 'A', starterCode: { java: '', cpp: '', python: '' }
          });
        } else {
          generatedQuestions.push({
            text: `[${autoConfig.category} - ${autoConfig.difficulty}] Problem #${i}: Write an optimal function to solve this ${autoConfig.category} problem.`,
            category: autoConfig.category, type: 'CODING', options: [], answer: '',
            starterCode: {
              java: `public class Solution {\n    // Solve ${autoConfig.category} problem here\n    public static void main(String[] args) {\n        System.out.println("Test Complete");\n    }\n}`,
              cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solve ${autoConfig.category} problem here\n    return 0;\n}`,
              python: `# Solve ${autoConfig.category} problem here\ndef solve():\n    pass`
            }
          });
        }
      }
      const payload = { title, type, durationMinutes: autoConfig.count * 4, questions: generatedQuestions };
      await axios.post('http://localhost:8080/api/assessments/create', payload);
      setMsgText(`Successfully Auto-Generated and Published ${autoConfig.count} Questions!`);
      finalizeSave();
    } catch (err) {
      alert("Failed to auto-generate questions.");
    } finally {
      setLoadingAuto(false);
    }
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 4, p: 4, maxWidth: 950, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, borderBottom: '2px solid #f0f0f0', pb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Quiz fontSize="large" /> Assessment Studio
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          color="primary"
          size="medium"
        >
          <ToggleButton value="build" sx={{ fontWeight: 'bold', px: 3 }}>Build New Test</ToggleButton>
          <ToggleButton value="list" sx={{ fontWeight: 'bold', px: 3 }}>View Published Tests</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{msgText}</Alert>}

      {/* --- LIST MODE --- */}
      {viewMode === 'list' && (
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Live Assessments in Database</Typography>
          {publishedTests.length === 0 ? (
            <Alert severity="info">No assessments have been published to the database yet.</Alert>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell fontWeight="bold">ID</TableCell>
                  <TableCell fontWeight="bold">Title</TableCell>
                  <TableCell fontWeight="bold">Type</TableCell>
                  <TableCell fontWeight="bold">Questions</TableCell>
                  <TableCell fontWeight="bold">Duration</TableCell>
                  <TableCell align="right" fontWeight="bold">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishedTests.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>#{test.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{test.title}</TableCell>
                    <TableCell><Chip label={test.type} color={test.type === 'CODING' ? 'secondary' : 'primary'} size="small" /></TableCell>
                    <TableCell>{test.questions?.length || 0} Qs</TableCell>
                    <TableCell>{test.durationMinutes} mins</TableCell>
                    <TableCell align="right">
                      {/* ADDED VIEW BUTTON HERE */}
                      <Tooltip title="View Assessment Details">
                        <IconButton color="primary" onClick={() => handleOpenView(test)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Assessment">
                        <IconButton color="error" onClick={() => deleteAssessment(test.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* VIEW ASSESSMENT DIALOG MODAL */}
          <Dialog open={viewDialogOpen} onClose={handleCloseView} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                {selectedAssessment?.title}
              </Typography>
              <Chip label={selectedAssessment?.type} color={selectedAssessment?.type === 'CODING' ? 'secondary' : 'primary'} />
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.secondary">
                Duration: {selectedAssessment?.durationMinutes} mins &nbsp;|&nbsp; Total Questions: {selectedAssessment?.questions?.length || 0}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {selectedAssessment?.questions?.map((q, idx) => (
                <Paper key={idx} elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    Question #{idx + 1} &nbsp;<Chip label={q.category} size="small" variant="outlined" />
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                    {q.text}
                  </Typography>

                  {q.type === 'MCQ' ? (
                    <Box>
                      <Grid container spacing={1}>
                        {q.options?.map((opt, oIdx) => (
                          <Grid item xs={12} sm={6} key={oIdx}>
                            <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #ddd', borderRadius: 2 }}>
                              {opt}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mt: 2 }}>
                        Correct Answer: {q.answer}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" gutterBottom color="text.secondary">Included Starter Code:</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        {q.starterCode?.java && <Chip label="Java" size="small" color="info" />}
                        {q.starterCode?.cpp && <Chip label="C++" size="small" color="info" />}
                        {q.starterCode?.python && <Chip label="Python" size="small" color="info" />}
                      </Box>
                      <Paper sx={{ mt: 1, p: 2, bgcolor: '#1e1e1e', color: '#00ff00', fontFamily: 'monospace', fontSize: '0.9rem', overflowX: 'auto', borderRadius: 2 }}>
                        {q.starterCode?.java || q.starterCode?.cpp || q.starterCode?.python || "No starter code provided."}
                      </Paper>
                    </Box>
                  )}
                </Paper>
              ))}
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Button onClick={handleCloseView} variant="contained" size="large" sx={{ fontWeight: 'bold', borderRadius: 2, px: 4 }}>
                Close Viewer
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      )}

      {/* --- BUILD MODE --- */}
      {viewMode === 'build' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <ToggleButtonGroup value={creationMode} exclusive onChange={(e, newMode) => newMode && setCreationMode(newMode)} size="small" color="secondary">
              <ToggleButton value="manual" sx={{ fontWeight: 'bold' }}><EditNote sx={{ mr: 1 }} /> Manual Add</ToggleButton>
              <ToggleButton value="auto" sx={{ fontWeight: 'bold' }}><AutoAwesome sx={{ mr: 1 }} /> Auto / AI Generate</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Stack spacing={3} sx={{ mb: 4 }}>
            <TextField label="Assessment Title" fullWidth required placeholder="e.g., TCS NQT Aptitude & Coding" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="domain-select-label">Assessment Domain</InputLabel>
                  <Select labelId="domain-select-label" id="domain-select" value={type} label="Assessment Domain" onChange={handleTypeChange}>
                    <MenuItem value="APTITUDE">Aptitude, Logical & Verbal Reasoning</MenuItem>
                    <MenuItem value="CODING">Data Structures & Algorithms (Coding)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Duration (Minutes)" type="number" fullWidth required value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
              </Grid>
            </Grid>
          </Stack>

          {/* Auto Mode UI */}
          {creationMode === 'auto' ? (
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: '#f0f4f8', border: '1px dashed #1976d2' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome /> Automated Question Bank Generator
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="auto-category-label">Category / Topic</InputLabel>
                    <Select labelId="auto-category-label" id="auto-category-select" value={autoConfig.category} label="Category / Topic" onChange={(e) => setAutoConfig({...autoConfig, category: e.target.value})}>
                      {type === 'APTITUDE' ? (
                        [ <MenuItem key="1" value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>, <MenuItem key="2" value="Logical Reasoning">Logical Reasoning</MenuItem>, <MenuItem key="3" value="Verbal Ability">Verbal Ability & English</MenuItem>, <MenuItem key="4" value="Data Interpretation">Data Interpretation</MenuItem> ]
                      ) : (
                        [ <MenuItem key="6" value="Arrays & Strings">Arrays & Strings</MenuItem>, <MenuItem key="7" value="Linked Lists">Linked Lists</MenuItem>, <MenuItem key="8" value="Stacks & Queues">Stacks & Queues</MenuItem>, <MenuItem key="9" value="Trees & Graphs">Trees & Graphs</MenuItem>, <MenuItem key="10" value="Dynamic Programming">Dynamic Programming</MenuItem> ]
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="auto-diff-label">Difficulty Level</InputLabel>
                    <Select labelId="auto-diff-label" id="auto-diff-select" value={autoConfig.difficulty} label="Difficulty Level" onChange={(e) => setAutoConfig({...autoConfig, difficulty: e.target.value})}>
                      <MenuItem value="Easy">Easy (Service-based)</MenuItem>
                      <MenuItem value="Medium">Medium (Product-based)</MenuItem>
                      <MenuItem value="Hard">Hard (FAANG)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Number of Questions" type="number" fullWidth inputProps={{ min: 1, max: 25 }} value={autoConfig.count} onChange={(e) => setAutoConfig({...autoConfig, count: Number(e.target.value)})} />
                </Grid>
              </Grid>
              <Button variant="contained" size="large" fullWidth onClick={handleAutoGenerate} disabled={loadingAuto} sx={{ py: 1.8, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 3 }} startIcon={<AutoAwesome />}>
                {loadingAuto ? <CircularProgress size={24} color="inherit" /> : `Auto-Generate & Publish ${autoConfig.count} Questions`}
              </Button>
            </Paper>
          ) : (
            /* Manual Mode UI */
            <form onSubmit={handleSaveAssessment}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">Manual Question Builder</Typography>
                  <Chip label={`Total Questions: ${questions.length}`} color="primary" sx={{ fontWeight: 'bold' }} />
                </Box>
                {questions.map((q, qIndex) => (
                  <Paper key={qIndex} elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">Question #{qIndex + 1}</Typography>
                      {questions.length > 1 && (<Button color="error" size="small" startIcon={<Delete />} onClick={() => removeQuestionField(qIndex)}>Remove</Button>)}
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`man-cat-${qIndex}`}>Sub-Category</InputLabel>
                          <Select labelId={`man-cat-${qIndex}`} id={`man-cat-sel-${qIndex}`} value={q.category} label="Sub-Category" onChange={(e) => handleQuestionChange(qIndex, 'category', e.target.value)}>
                            {type === 'APTITUDE' ? (
                              [ <MenuItem key="m1" value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>, <MenuItem key="m2" value="Logical Reasoning">Logical Reasoning</MenuItem>, <MenuItem key="m3" value="Verbal Ability">Verbal Ability & Grammar</MenuItem>, <MenuItem key="m4" value="Data Interpretation">Data Interpretation</MenuItem> ]
                            ) : (
                              [ <MenuItem key="c1" value="Arrays & Strings">Arrays & Strings</MenuItem>, <MenuItem key="c2" value="Linked Lists">Linked Lists</MenuItem>, <MenuItem key="c3" value="Stacks & Queues">Stacks & Queues</MenuItem>, <MenuItem key="c4" value="Trees & Graphs">Trees & Graphs</MenuItem> ]
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <TextField label="Problem Description" fullWidth required multiline rows={2} value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} sx={{ mb: 2 }} />
                    {type === 'APTITUDE' ? (
                      <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">Options (A, B, C, D)</Typography>
                        <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
                          {q.options.map((opt, oIndex) => (
                            <Grid item xs={12} sm={6} key={oIndex}><TextField label={`Option ${String.fromCharCode(65 + oIndex)}`} fullWidth size="small" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} /></Grid>
                          ))}
                        </Grid>
                        <TextField label="Correct Answer Letter (e.g., A)" fullWidth size="small" value={q.answer} onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} />
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>Starter Template Codes</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}><TextField label="C++" fullWidth multiline rows={3} value={q.starterCode?.cpp || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, cpp: e.target.value })} /></Grid>
                          <Grid item xs={12} md={4}><TextField label="Java" fullWidth multiline rows={3} value={q.starterCode?.java || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, java: e.target.value })} /></Grid>
                          <Grid item xs={12} md={4}><TextField label="Python" fullWidth multiline rows={3} value={q.starterCode?.python || ''} onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, python: e.target.value })} /></Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                ))}
                <Button variant="outlined" startIcon={<AddCircle />} onClick={addQuestionField} sx={{ py: 1.5, fontWeight: 'bold' }}>Add Another Question Manually</Button>
                <Button type="submit" variant="contained" size="large" sx={{ py: 1.8, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}>Publish Manual Assessment</Button>
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
                Manage system users, view analytics, publish assessments, and control global settings.
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
            <Tab icon={<Assessment />} iconPosition="start" label="System Overview" />
            <Tab icon={<School />} iconPosition="start" label="Teacher Directory" />
            <Tab icon={<People />} iconPosition="start" label="Student Directory" />
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
        {tabIndex === 3 && <AdminAssessmentManager />}
        {tabIndex === 4 && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={8}><BulkUserUpload /></Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;