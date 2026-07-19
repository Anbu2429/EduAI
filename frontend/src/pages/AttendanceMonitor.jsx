import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip } from '@mui/material';

function AttendanceMonitor() {
  const [attendance, setAttendance] = useState([
    { id: 1, name: "Anbuselvan S", status: "Pending" },
    { id: 2, name: "Heera Mohamed", status: "Pending" }
  ]);

  const markAttendance = (id, status) => {
    setAttendance(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Live Attendance Session - Batch 6</Typography>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Table>
          <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {attendance.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell><Chip label={s.status} color={s.status === 'Pending' ? 'default' : 'success'} /></TableCell>
                <TableCell>
                  <Button onClick={() => markAttendance(s.id, 'Present')} sx={{ mr: 1 }}>Mark Present</Button>
                  <Button color="error" onClick={() => markAttendance(s.id, 'Absent')}>Mark Absent</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default AttendanceMonitor;