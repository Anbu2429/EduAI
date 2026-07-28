import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, 
  TableCell, TableHead, TableRow, Button, Avatar, Chip, 
  Paper, Stack, Alert, CircularProgress, TextField, MenuItem 
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

function TeacherAttendance() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter States for Date, Session, and Subject
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('MORNING');
  const [selectedSubject, setSelectedSubject] = useState('General Class');

  // Fetch students and existing attendance records for the chosen date & session
  useEffect(() => {
    const fetchRosterAndAttendance = async () => {
      setLoading(true);
      try {
        // 1. Fetch all student profiles
        const studentRes = await axios.get('http://localhost:8080/api/auth/users/Student');
        const studentList = studentRes.data;
        setStudents(studentList);

        // 2. Fetch existing saved attendance logs for this date & session
        const attRes = await axios.get(`http://localhost:8080/api/attendance/filter?date=${selectedDate}&session=${selectedSession}`);
        const savedRecords = attRes.data;

        // Map existing statuses or default everyone to 'Present'
        const initialStatus = {};
        studentList.forEach(student => {
          const existingRecord = savedRecords.find(record => record.studentId === student.id);
          initialStatus[student.id] = existingRecord 
            ? (existingRecord.status === 'PRESENT' ? 'Present' : 'Absent') 
            : 'Present';
        });
        setAttendance(initialStatus);
      } catch (err) {
        console.error("Failed to load roster or attendance records", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRosterAndAttendance();
  }, [selectedDate, selectedSession]);

  // Toggle student status (Present / Absent)
  const handleStatusChange = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  // Submit Attendance Record to Spring Boot Backend (Upsert)
  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);

      const promises = students.map(student => {
        const currentStatus = attendance[student.id] || 'Present';
        const statusValue = currentStatus === 'Present' ? 'PRESENT' : 'ABSENT';
        
        const payload = {
          studentId: student.id,
          status: statusValue,
          session: selectedSession,
          date: selectedDate,
          subject: selectedSubject
        };

        return axios.post('http://localhost:8080/api/attendance/mark', payload);
      });

      await Promise.all(promises);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      alert("Failed to save attendance and send emails.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Top Header with Back Button */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/teacher')}
          sx={{ borderRadius: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#1a237e' }}>
          Live Class Attendance Monitor
        </Typography>
      </Stack>

      {/* Date, Session & Subject Filter Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Select Date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />

        <TextField
          label="Session / Hour"
          select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="MORNING">Morning Session</MenuItem>
          <MenuItem value="AFTERNOON">Afternoon Session</MenuItem>
        </TextField>

        <TextField
          label="Subject Name"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          sx={{ minWidth: 250 }}
        />
      </Paper>

      {submitted && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Attendance successfully recorded for {selectedDate} ({selectedSession}), synced with the database, and absence alert emails dispatched!
        </Alert>
      )}

      {/* Student List Table */}
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Roster for {selectedDate} — {selectedSession} ({students.length} Students Found)
          </Typography>
          <Chip label="Database Synced" color="success" sx={{ fontWeight: 'bold' }} />
        </Box>

        {loading ? (
          <Box py={8} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Roll Number / Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Mark Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => {
                  const currentStatus = attendance[student.id] || 'Present';
                  return (
                    <TableRow key={student.id} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{student.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#1976d2' }}>
                            {student.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight="bold">{student.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={student.role} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={currentStatus} 
                          color={currentStatus === 'Present' ? 'success' : 'error'} 
                          sx={{ fontWeight: 'bold' }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button 
                            variant={currentStatus === 'Present' ? 'contained' : 'outlined'} 
                            color="success" 
                            size="small"
                            onClick={() => handleStatusChange(student.id, 'Present')}
                            startIcon={<CheckCircle />}
                          >
                            Present
                          </Button>
                          <Button 
                            variant={currentStatus === 'Absent' ? 'contained' : 'outlined'} 
                            color="error" 
                            size="small"
                            onClick={() => handleStatusChange(student.id, 'Absent')}
                            startIcon={<Cancel />}
                          >
                            Absent
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No students found. Please add students through the Admin Bulk Import first.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Bottom Save Action */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          size="large" 
          color="primary" 
          onClick={handleSubmitAttendance}
          disabled={submitting || loading}
          sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Save & Submit Attendance"}
        </Button>
      </Box>

    </Box>
  );
}

export default TeacherAttendance;