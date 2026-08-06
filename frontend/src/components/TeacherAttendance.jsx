import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody,
  TableCell, TableHead, TableRow, Button, Avatar, Chip,
  Stack, Alert, CircularProgress, TextField, MenuItem,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Groups } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

/* ---------------------------------------------------------------------- *
 * DESIGN TOKENS
 * ---------------------------------------------------------------------- */
const navy = '#0B2E59';
const blue = '#1D4ED8';
const blueSoft = '#EEF3FF';
const slate900 = '#111827';
const slate600 = '#5B6472';
const slate400 = '#94A0B2';
const border = '#E7EAF0';
const surface = '#FFFFFF';
const canvas = '#F6F8FC';
const red = '#D14343';
const redSoft = '#FCEEEE';
const green = '#1E8A5B';
const greenSoft = '#EAF7F1';

const fontHead = "'Plus Jakarta Sans', 'Inter', sans-serif";
const fontBody = "'Inter', -apple-system, sans-serif";

function useGoogleFonts() {
  useEffect(() => {
    const id = 'teacher-dashboard-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', fontFamily: fontBody, fontSize: 14, bgcolor: canvas,
    '& fieldset': { borderColor: border },
    '&:hover fieldset': { borderColor: blue },
    '&.Mui-focused fieldset': { borderColor: blue },
  },
  '& .MuiInputLabel-root': { fontFamily: fontBody, fontSize: 13, color: slate600 },
};

function TeacherAttendance() {
  const navigate = useNavigate();
  useGoogleFonts();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('MORNING');
  const [selectedSubject, setSelectedSubject] = useState('General Class');

  useEffect(() => {
    const fetchRosterAndAttendance = async () => {
      setLoading(true);
      try {
        // 💡 UPDATED: Now fetches ONLY the specific students assigned to this teacher's department/year/class!
        const studentRes = await axios.get('http://localhost:8080/api/auth/class-roster');
        const studentList = studentRes.data;
        setStudents(studentList);

        const attRes = await axios.get(`http://localhost:8080/api/attendance/filter?date=${selectedDate}&session=${selectedSession}`);
        const savedRecords = attRes.data;

        const initialStatus = {};
        studentList.forEach((student) => {
          const existingRecord = savedRecords.find((record) => record.studentId === student.id);
          initialStatus[student.id] = existingRecord
            ? (existingRecord.status === 'PRESENT' ? 'Present' : 'Absent')
            : 'Present';
        });
        setAttendance(initialStatus);
      } catch (err) {
        console.error('Failed to load roster or attendance records', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRosterAndAttendance();
  }, [selectedDate, selectedSession]);

  const handleStatusChange = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);

      const promises = students.map((student) => {
        const currentStatus = attendance[student.id] || 'Present';
        const statusValue = currentStatus === 'Present' ? 'PRESENT' : 'ABSENT';

        const payload = {
          studentId: student.id,
          status: statusValue,
          session: selectedSession,
          date: selectedDate,
          subject: selectedSubject,
        };

        return axios.post('http://localhost:8080/api/attendance/mark', payload);
      });

      await Promise.all(promises);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      alert('Failed to save attendance and send emails.');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter((s) => (attendance[s.id] || 'Present') === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <Box sx={{ bgcolor: canvas, minHeight: '100vh', pb: 8 }}>
      {/* Header ---------------------------------------------------------- */}
      <Box sx={{ bgcolor: surface, borderBottom: `1px solid ${border}` }}>
        <Box sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
          <Button
            startIcon={<ArrowBack sx={{ fontSize: 17 }} />}
            onClick={() => navigate('/teacher')}
            sx={{
              color: slate600, fontFamily: fontBody, fontWeight: 600, fontSize: 13, textTransform: 'none',
              mb: 2, p: 0, '&:hover': { bgcolor: 'transparent', color: blue },
            }}
          >
            Back to Dashboard
          </Button>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={2}>
            <Box>
              <Chip
                label="Attendance Monitor"
                size="small"
                sx={{ bgcolor: blueSoft, color: blue, fontFamily: fontBody, fontWeight: 600, fontSize: 11, mb: 1.5, borderRadius: '6px' }}
              />
              <Typography sx={{ fontFamily: fontHead, fontWeight: 800, fontSize: { xs: 24, md: 30 }, color: navy, lineHeight: 1.15 }}>
                Live Class Attendance
              </Typography>
            </Box>

            {!loading && students.length > 0 && (
              <Stack direction="row" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: greenSoft, px: 2, py: 1, borderRadius: '10px' }}>
                  <CheckCircle sx={{ fontSize: 16, color: green }} />
                  <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 13, color: green }}>{presentCount} Present</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: redSoft, px: 2, py: 1, borderRadius: '10px' }}>
                  <Cancel sx={{ fontSize: 16, color: red }} />
                  <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 13, color: red }}>{absentCount} Absent</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, md: 6 }, mt: 4 }}>
        {/* Filter bar ---------------------------------------------------- */}
        <Box sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: '16px', p: 3, mb: 3, display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ ...inputSx, minWidth: 190 }}
          />
          <TextField
            label="Session"
            select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            sx={{ ...inputSx, minWidth: 190 }}
          >
            <MenuItem value="MORNING">Morning Session</MenuItem>
            <MenuItem value="AFTERNOON">Afternoon Session</MenuItem>
          </TextField>
          <TextField
            label="Subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            sx={{ ...inputSx, minWidth: 240 }}
          />
        </Box>

        {submitted && (
          <Alert
            severity="success"
            sx={{
              mb: 3, borderRadius: '12px', fontFamily: fontBody, fontSize: 13.5,
              bgcolor: greenSoft, color: '#0F5132', border: `1px solid ${green}33`,
              '& .MuiAlert-icon': { color: green },
            }}
          >
            Attendance successfully recorded for {selectedDate} ({selectedSession}), synced with the database, and absence alert emails dispatched.
          </Alert>
        )}

        {/* Roster table ---------------------------------------------------- */}
        <Box sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <Stack
            direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1}
            sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: blueSoft, color: blue, width: 34, height: 34 }}>
                <Groups sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 16, color: navy }}>
                  Roster — {selectedDate}, {selectedSession === 'MORNING' ? 'Morning' : 'Afternoon'}
                </Typography>
                <Typography sx={{ fontFamily: fontBody, fontSize: 12.5, color: slate400 }}>
                  {students.length} student{students.length === 1 ? '' : 's'} found
                </Typography>
              </Box>
            </Stack>
            <Chip
              label="Database Synced"
              size="small"
              sx={{ bgcolor: greenSoft, color: green, fontFamily: fontBody, fontWeight: 600, fontSize: 11.5, borderRadius: '6px' }}
            />
          </Stack>

          {loading ? (
            <Box py={8} display="flex" flexDirection="column" alignItems="center" gap={1.5}>
              <CircularProgress sx={{ color: blue }} size={28} thickness={4} />
              <Typography sx={{ fontFamily: fontBody, fontSize: 13, color: slate600 }}>Loading custom roster…</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={theadCell}>ID</TableCell>
                  <TableCell sx={theadCell}>Student</TableCell>
                  <TableCell sx={theadCell}>Class Routing</TableCell>
                  <TableCell sx={theadCell}>Status</TableCell>
                  <TableCell align="right" sx={theadCell}>Mark Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => {
                    const currentStatus = attendance[student.id] || 'Present';
                    const isPresent = currentStatus === 'Present';
                    return (
                      <TableRow key={student.id} sx={{ '&:hover': { bgcolor: canvas }, '&:last-of-type td': { borderBottom: 'none' } }}>
                        <TableCell sx={tbodyCell}>
                          <Typography sx={{ fontFamily: fontBody, fontWeight: 600, fontSize: 13, color: slate400 }}>#{student.id}</Typography>
                        </TableCell>
                        <TableCell sx={tbodyCell}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ bgcolor: navy, width: 32, height: 32, fontFamily: fontHead, fontWeight: 700, fontSize: 13 }}>
                              {student.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontFamily: fontBody, fontWeight: 600, fontSize: 14, color: slate900 }}>{student.username}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={tbodyCell}>
                          <Chip
                            label={`${student.department || 'N/A'} • Sec ${student.classSection || 'N/A'}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: fontBody, fontSize: 11.5, borderColor: border, color: slate600, borderRadius: '6px' }}
                          />
                        </TableCell>
                        <TableCell sx={tbodyCell}>
                          <Chip
                            label={currentStatus}
                            size="small"
                            sx={{
                              fontFamily: fontBody, fontWeight: 700, fontSize: 12, borderRadius: '6px',
                              bgcolor: isPresent ? greenSoft : redSoft, color: isPresent ? green : red,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={tbodyCell}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              onClick={() => handleStatusChange(student.id, 'Present')}
                              startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                              sx={
                                isPresent
                                  ? { bgcolor: green, color: '#fff', fontFamily: fontBody, fontWeight: 600, fontSize: 12.5, textTransform: 'none', borderRadius: '8px', px: 1.6, '&:hover': { bgcolor: '#166B47' } }
                                  : { color: green, borderColor: `${green}55`, border: '1px solid', fontFamily: fontBody, fontWeight: 600, fontSize: 12.5, textTransform: 'none', borderRadius: '8px', px: 1.6, '&:hover': { borderColor: green, bgcolor: greenSoft } }
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleStatusChange(student.id, 'Absent')}
                              startIcon={<Cancel sx={{ fontSize: 16 }} />}
                              sx={
                                !isPresent
                                  ? { bgcolor: red, color: '#fff', fontFamily: fontBody, fontWeight: 600, fontSize: 12.5, textTransform: 'none', borderRadius: '8px', px: 1.6, '&:hover': { bgcolor: '#A93434' } }
                                  : { color: red, borderColor: `${red}55`, border: '1px solid', fontFamily: fontBody, fontWeight: 600, fontSize: 12.5, textTransform: 'none', borderRadius: '8px', px: 1.6, '&:hover': { borderColor: red, bgcolor: redSoft } }
                              }
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
                    <TableCell colSpan={5} align="center" sx={{ py: 6, border: 'none' }}>
                      <Typography sx={{ fontFamily: fontBody, fontSize: 13.5, color: slate600 }}>
                        No students found matching your assigned Department and Year.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* Save action ---------------------------------------------------- */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            disableElevation
            size="large"
            onClick={handleSubmitAttendance}
            disabled={submitting || loading || students.length === 0}
            sx={{
              bgcolor: blue, px: 4, py: 1.4, borderRadius: '10px', fontFamily: fontHead,
              fontWeight: 700, fontSize: 14, textTransform: 'none',
              '&:hover': { bgcolor: navy }, '&.Mui-disabled': { bgcolor: `${blue}55`, color: '#fff' },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Save & Submit Attendance'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

const theadCell = {
  fontFamily: fontBody, fontWeight: 600, fontSize: 12, color: slate400,
  textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: `1px solid ${border}`, bgcolor: canvas,
};
const tbodyCell = { borderBottom: `1px solid ${border}`, py: 1.4 };

export default TeacherAttendance;