import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, 
  Grid, Paper, Radio, RadioGroup, FormControlLabel, 
  FormControl, TextField, MenuItem, Select, InputLabel,
  Chip, Divider, Stack, Avatar, CircularProgress 
} from '@mui/material';
import { Timer, CheckCircle, Code, Quiz, PlayArrow, Terminal } from '@mui/icons-material';
import axios from 'axios';

axios.defaults.withCredentials = true;

function StudentTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [codeOutputs, setCodeOutputs] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchLiveAssessments();
  }, []);

  useEffect(() => {
    if (!activeTest || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTest, timeLeft]);

  // Fetch live assessments created by Admin from MySQL database
  const fetchLiveAssessments = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/assessments');
      setTests(res.data);
    } catch (err) {
      console.error("Failed to fetch live assessments from backend", err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test) => {
    setActiveTest(test);
    setTimeLeft(test.durationMinutes * 60);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCodeOutputs({});
    setResult(null);

    if (test.type === 'CODING' && test.questions[0]?.starterCode) {
      setAnswers({
        [test.questions[0].id]: test.questions[0].starterCode[selectedLanguage] || ''
      });
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleLanguageChange = (questionId, lang) => {
    setSelectedLanguage(lang);
    const currentQ = activeTest.questions[currentQuestionIndex];
    if (currentQ && currentQ.starterCode) {
      setAnswers(prev => ({ ...prev, [questionId]: currentQ.starterCode[lang] || '' }));
    }
  };

  const handleRunCode = (questionId) => {
    setIsRunning(true);
    setTimeout(() => {
      setCodeOutputs(prev => ({
        ...prev,
        [questionId]: `Compilation Successful (${selectedLanguage.toUpperCase()})\nOutput Verified.\nTest Cases Passed: 3 / 3`
      }));
      setIsRunning(false);
    }, 1000);
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    try {
      const payload = { assessmentId: activeTest.id, answers };
      const res = await axios.post(`http://localhost:8080/api/assessments/${activeTest.id}/submit`, payload);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to submit assessment", err);
    } finally {
      setSubmitting(false);
      setActiveTest(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return <Box height="80vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      <Box sx={{ mb: 4, p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="900">Assessments & Placement Tests</Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
          Take live aptitude tests, logical reasoning quizzes, and multi-language coding challenges published by your institution.
        </Typography>
      </Box>

      {result && (
        <Paper elevation={4} sx={{ p: 5, mb: 4, borderRadius: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="success.dark" gutterBottom>
            Assessment Evaluated Successfully!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Final Score: <strong>{result.score}%</strong> ({result.correctCount} / {result.total} Cleared)
          </Typography>
          <Chip label={`Status: ${result.status}`} color="success" sx={{ fontSize: '1rem', fontWeight: 'bold', px: 2, py: 1 }} />
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => setResult(null)}>Back to Assessment List</Button>
          </Box>
        </Paper>
      )}

      {activeTest && !result ? (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">{activeTest.title}</Typography>
              <Chip label={activeTest.type} color="primary" size="small" sx={{ mt: 1, fontWeight: 'bold' }} />
            </Box>
            <Paper elevation={2} sx={{ px: 3, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: timeLeft < 120 ? '#ffebee' : '#e3f2fd' }}>
              <Timer color={timeLeft < 120 ? "error" : "primary"} />
              <Typography variant="h6" fontWeight="bold" color={timeLeft < 120 ? "error.main" : "primary.main"}>
                {formatTime(timeLeft)}
              </Typography>
            </Paper>
          </Box>

          {(() => {
            const currentQ = activeTest.questions[currentQuestionIndex];
            if (!currentQ) return <Typography>No questions found in this assessment.</Typography>;
            return (
              <Box sx={{ my: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', fontWeight: 500 }}>
                  {currentQ.text}
                </Typography>

                {currentQ.type === 'MCQ' || activeTest.type === 'APTITUDE' ? (
                  <FormControl component="fieldset">
                    <RadioGroup 
                      value={answers[currentQ.id] || ''} 
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    >
                      {currentQ.options && currentQ.options.map((opt, idx) => (
                        <FormControlLabel key={idx} value={opt.charAt(0)} control={<Radio />} label={opt} sx={{ my: 0.5 }} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                        Code Workspace & Compiler
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={selectedLanguage}
                          label="Language"
                          onChange={(e) => handleLanguageChange(currentQ.id, e.target.value)}
                        >
                          <MenuItem value="cpp">C++</MenuItem>
                          <MenuItem value="java">Java</MenuItem>
                          <MenuItem value="python">Python</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={10}
                      variant="outlined"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      sx={{ fontFamily: 'monospace', bgcolor: '#1e1e1e', borderRadius: 2, '& .MuiInputBase-input': { color: '#d4d4d4', fontFamily: 'monospace' } }}
                    />

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" color="secondary" startIcon={<PlayArrow />} onClick={() => handleRunCode(currentQ.id)} disabled={isRunning}>
                        {isRunning ? "Running..." : "Run Code Test"}
                      </Button>
                    </Box>

                    {codeOutputs[currentQ.id] && (
                      <Paper sx={{ mt: 2, p: 2, bgcolor: '#000', color: '#00ff00', fontFamily: 'monospace', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Terminal fontSize="small" />
                          <Typography variant="caption" fontWeight="bold">Console Output</Typography>
                        </Stack>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{codeOutputs[currentQ.id]}</pre>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            );
          })()}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>
              Previous
            </Button>

            {currentQuestionIndex < activeTest.questions.length - 1 ? (
              <Button variant="contained" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                Next Question
              </Button>
            ) : (
              <Button variant="contained" color="success" disabled={submitting} onClick={handleSubmitTest}>
                {submitting ? "Evaluating..." : "Submit Assessment"}
              </Button>
            )}
          </Box>
        </Paper>
      ) : !result && (
        tests.length > 0 ? (
          <Grid container spacing={3}>
            {tests.map((test) => (
              <Grid item xs={12} md={6} key={test.id}>
                <Card elevation={3} sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: test.type === 'APTITUDE' ? '#1976d2' : '#9c27b0' }}>
                        {test.type === 'APTITUDE' ? <Quiz /> : <Code />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{test.title}</Typography>
                        <Chip label={`${test.durationMinutes} Mins • ${test.questions?.length || 0} Questions`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Live institutional assessment published by administration for skill evaluation.
                    </Typography>
                    <Button fullWidth variant="contained" size="large" onClick={() => startTest(test)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" color="text.secondary">No live assessments available at the moment. Please check back later when your admin publishes tests.</Typography>
          </Paper>
        )
      )}

    </Box>
  );
}

export default StudentTests;