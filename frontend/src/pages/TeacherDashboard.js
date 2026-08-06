import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Button, Stack, Chip, List, ListItem, ListItemText,
  CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Avatar,
} from '@mui/material';
import {
  WarningAmberRounded, CheckCircle, ArrowForward, People, AssignmentTurnedIn,
  School, Quiz, Code, TrendingUp,
} from '@mui/icons-material';
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

const today = new Date();
const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function TeacherDashboard() {
  const navigate = useNavigate();
  useGoogleFonts();

  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('Professor');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const meRes = await axios.get('http://localhost:8080/api/auth/me');
        setTeacherName(meRes.data.username || 'Professor');
        
        // 💡 UPDATED: Set the Assigned Classes using the exact routing details from the backend
        if (meRes.data.department || meRes.data.year || meRes.data.classSection) {
          setAssignedClasses([{
            id: 'primary-class',
            department: meRes.data.department || 'All Departments',
            year: meRes.data.year || 'All Years',
            section: meRes.data.classSection || 'All Sections'
          }]);
        } else {
          setAssignedClasses([]);
        }

        const [teacherDashRes, assessmentsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/dashboard/teacher').catch(() => ({ data: { attendanceAlerts: [] } })),
          axios.get('http://localhost:8080/api/assessments').catch(() => ({ data: [] })),
        ]);

        setAttendanceAlerts(teacherDashRes.data?.attendanceAlerts || []);
        setAssessments(assessmentsRes.data || []);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const hasRealAlerts = attendanceAlerts.length > 0 && attendanceAlerts[0]?.student !== 'None';
  const aptitudeCount = assessments.filter((a) => a.type === 'APTITUDE').length;
  const codingCount = assessments.filter((a) => a.type === 'CODING').length;

  const kpis = [
    { label: 'Attendance flags', value: hasRealAlerts ? attendanceAlerts.length : 0, icon: <People />, path: '/teacher/attendance', tone: hasRealAlerts ? red : green },
    { label: 'Assessments live', value: assessments.length, icon: <AssignmentTurnedIn />, tone: blue },
    { label: 'Classes assigned', value: assignedClasses.length, icon: <School />, tone: blue },
    { label: 'Coding tests', value: codingCount, icon: <Code />, tone: blue },
  ];

  if (loading) {
    return (
      <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: canvas, gap: 2 }}>
        <CircularProgress sx={{ color: blue }} size={30} thickness={4} />
        <Typography sx={{ fontFamily: fontBody, fontSize: 13, color: slate600 }}>Loading your dashboard…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: canvas, minHeight: '100vh', pb: 8 }}>
      {/* Header ---------------------------------------------------------- */}
      <Box sx={{ bgcolor: surface, borderBottom: `1px solid ${border}` }}>
        <Box sx={{ px: { xs: 3, md: 6 }, py: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: 2 }}>
          <Box>
            <Chip
              label="Teacher Portal"
              size="small"
              sx={{ bgcolor: blueSoft, color: blue, fontFamily: fontBody, fontWeight: 600, fontSize: 11, mb: 1.5, borderRadius: '6px' }}
            />
            <Typography sx={{ fontFamily: fontHead, fontWeight: 800, fontSize: { xs: 26, md: 32 }, color: navy, lineHeight: 1.15 }}>
              Welcome back, {teacherName}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, fontSize: 14, color: slate600, mt: 0.5 }}>
              {dateLabel} — here's what needs your attention today.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            endIcon={<ArrowForward />}
            onClick={() => navigate('/teacher/attendance')}
            sx={{
              bgcolor: blue, fontFamily: fontHead, fontWeight: 600, textTransform: 'none',
              borderRadius: '10px', px: 3, py: 1.2, fontSize: 14,
              '&:hover': { bgcolor: navy },
            }}
          >
            Open Attendance Monitor
          </Button>
        </Box>
      </Box>

      {/* KPI row ----------------------------------------------------------- */}
      <Box sx={{ px: { xs: 3, md: 6 }, mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {kpis.map((k) => (
          <Box
            key={k.label}
            onClick={() => k.path && navigate(k.path)}
            sx={{
              bgcolor: surface, border: `1px solid ${border}`, borderRadius: '14px', p: 2.5,
              cursor: k.path ? 'pointer' : 'default', transition: 'all 0.15s',
              '&:hover': k.path ? { borderColor: blue, boxShadow: '0 4px 16px rgba(29,78,216,0.08)' } : {},
            }}
          >
            <Avatar sx={{ bgcolor: `${k.tone}14`, color: k.tone, width: 36, height: 36, mb: 1.5 }}>
              {React.cloneElement(k.icon, { sx: { fontSize: 19 } })}
            </Avatar>
            <Typography sx={{ fontFamily: fontHead, fontWeight: 800, fontSize: 28, color: navy, lineHeight: 1 }}>
              {k.value}
            </Typography>
            <Typography sx={{ fontFamily: fontBody, fontSize: 13, color: slate600, mt: 0.5 }}>
              {k.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Main grid ----------------------------------------------------------- */}
      <Box sx={{ px: { xs: 3, md: 6 }, mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' }, gap: 3 }}>

        {/* Attendance alerts */}
        <Box sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: hasRealAlerts ? redSoft : greenSoft, color: hasRealAlerts ? red : green, width: 34, height: 34 }}>
                {hasRealAlerts ? <WarningAmberRounded sx={{ fontSize: 18 }} /> : <CheckCircle sx={{ fontSize: 18 }} />}
              </Avatar>
              <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 16, color: navy }}>
                Attendance Alerts
              </Typography>
            </Stack>
            {hasRealAlerts && (
              <Chip label={`${attendanceAlerts.length} flagged`} size="small" sx={{ bgcolor: redSoft, color: red, fontFamily: fontBody, fontWeight: 600, fontSize: 12 }} />
            )}
          </Stack>

          {hasRealAlerts ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={theadCell}>Student</TableCell>
                  <TableCell sx={theadCell}>Issue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceAlerts.map((a, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: canvas }, '&:last-of-type td': { borderBottom: 'none' } }}>
                    <TableCell sx={tbodyCell}>
                      <Typography sx={{ fontFamily: fontBody, fontWeight: 600, fontSize: 14, color: slate900 }}>{a.student}</Typography>
                    </TableCell>
                    <TableCell sx={tbodyCell}>
                      <Chip label={a.issue} size="small" sx={{ bgcolor: redSoft, color: red, fontFamily: fontBody, fontWeight: 600, fontSize: 12, borderRadius: '6px' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
              <Avatar sx={{ bgcolor: greenSoft, color: green, width: 44, height: 44, mx: 'auto', mb: 1.5 }}>
                <CheckCircle sx={{ fontSize: 22 }} />
              </Avatar>
              <Typography sx={{ fontFamily: fontBody, fontWeight: 600, fontSize: 14, color: slate900 }}>All clear</Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: 13, color: slate600, mt: 0.5 }}>Every student currently has healthy attendance.</Typography>
            </Box>
          )}

          <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${border}`, bgcolor: canvas }}>
            <Button
              endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
              onClick={() => navigate('/teacher/attendance')}
              sx={{ color: blue, fontFamily: fontHead, fontWeight: 600, fontSize: 13, textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: navy } }}
            >
              Go to Attendance Monitor
            </Button>
          </Box>
        </Box>

        {/* Assigned classes */}
        <Box sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: '16px', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${border}` }}>
            <Avatar sx={{ bgcolor: blueSoft, color: blue, width: 34, height: 34 }}>
              <School sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 16, color: navy }}>
              Assigned Classes
            </Typography>
          </Stack>

          {assignedClasses.length > 0 ? (
            <List disablePadding>
              {assignedClasses.map((a, idx) => (
                <ListItem
                  key={a.id}
                  disableGutters
                  sx={{ px: 3, py: 2, borderBottom: idx === assignedClasses.length - 1 ? 'none' : `1px solid ${border}` }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 14.5, color: slate900 }}>
                          {a.department}
                        </Typography>
                        <Chip label="Primary" size="small" sx={{ bgcolor: blueSoft, color: blue, fontFamily: fontBody, fontWeight: 600, fontSize: 10, height: 19, borderRadius: '5px' }} />
                      </Stack>
                    }
                    secondary={
                      <Typography sx={{ fontFamily: fontBody, fontSize: 12.5, color: slate600, mt: 0.4 }}>
                        {[a.year, `Section ${a.section}`].filter(Boolean).join(' · ')}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
              <Typography sx={{ fontFamily: fontBody, fontSize: 13.5, color: slate600 }}>
                No classes assigned yet. Contact your administrator.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Assessment shortcuts ----------------------------------------------- */}
      <Box sx={{ px: { xs: 3, md: 6 }, mt: 3 }}>
        <Box sx={{ bgcolor: surface, border: `1px solid ${border}`, borderRadius: '16px', p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
            <Avatar sx={{ bgcolor: blueSoft, color: blue, width: 34, height: 34 }}>
              <Quiz sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: 16, color: navy }}>Assessment Shortcuts</Typography>
              <Typography sx={{ fontFamily: fontBody, fontSize: 12.5, color: slate400 }}>Published by administration</Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              { label: 'Aptitude tests live', value: aptitudeCount, icon: <Quiz /> },
              { label: 'Coding tests live', value: codingCount, icon: <Code /> },
              { label: 'Total published', value: assessments.length, icon: <TrendingUp /> },
            ].map((s) => (
              <Box key={s.label} sx={{ bgcolor: blueSoft, borderRadius: '12px', p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: surface, color: blue, width: 38, height: 38 }}>
                  {React.cloneElement(s.icon, { sx: { fontSize: 19 } })}
                </Avatar>
                <Box>
                  <Typography sx={{ fontFamily: fontHead, fontWeight: 800, fontSize: 22, color: navy, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontFamily: fontBody, fontSize: 12, color: slate600, mt: 0.3 }}>{s.label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Footer CTA banner ----------------------------------------------------- */}
      <Box sx={{ px: { xs: 3, md: 6 }, mt: 3 }}>
        <Box
          sx={{
            background: `linear-gradient(120deg, ${navy}, ${blue})`,
            borderRadius: '16px', p: { xs: 3, md: 4 }, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
          }}
        >
          <Typography sx={{ fontFamily: fontHead, fontWeight: 700, fontSize: { xs: 16, md: 18 }, color: '#fff' }}>
            Keep your classroom attendance up to date
          </Typography>
          <Button
            onClick={() => navigate('/teacher/attendance')}
            sx={{
              bgcolor: '#fff', color: navy, fontFamily: fontHead, fontWeight: 700, textTransform: 'none',
              borderRadius: '10px', px: 3, py: 1.1, fontSize: 14, '&:hover': { bgcolor: blueSoft },
            }}
          >
            Open Attendance Monitor
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
const tbodyCell = { borderBottom: `1px solid ${border}`, py: 1.6 };

export default TeacherDashboard;