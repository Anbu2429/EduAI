import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  MenuItem, Select, FormControl, InputLabel, Stack, Alert, 
  Paper, Grid, ToggleButton, ToggleButtonGroup, Chip, CircularProgress 
} from '@mui/material';
import { Quiz, AutoAwesome, EditNote, AddCircle, Delete } from '@mui/icons-material';
import axios from 'axios';

axios.defaults.withCredentials = true;

function AdminAssessmentManager() {
  const [creationMode, setCreationMode] = useState('manual'); // 'manual' or 'auto'
  const [title, setTitle] = useState('');
  const [type, setType] = useState('APTITUDE');
  const [durationMinutes, setDurationMinutes] = useState(20);

  // Manual Creation State
  const [questions, setQuestions] = useState([
    { text: '', category: 'Quantitative Aptitude', type: 'MCQ', options: ['', '', '', ''], answer: '', starterCode: { java: '', cpp: '', python: '' } }
  ]);

  // Auto-Generation State
  const [autoConfig, setAutoConfig] = useState({
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    count: 5
  });

  const [loadingAuto, setLoadingAuto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msgText, setMsgText] = useState('Assessment successfully published to database!');

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

  // --- HANDLE MANUAL SAVE ---
  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, type, durationMinutes, questions };
      await axios.post('http://localhost:8080/api/assessments/create', payload, { withCredentials: true });
      setSuccess(true);
      setMsgText('Assessment successfully published to database!');
      setTitle('');
      setQuestions([{ text: '', category: 'Quantitative Aptitude', type: 'MCQ', options: ['', '', '', ''], answer: '', starterCode: { java: '', cpp: '', python: '' } }]);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to create assessment", err);
      alert("Error saving assessment to database.");
    }
  };

  // --- HANDLE AI / AUTO-GENERATION ---
  const handleAutoGenerate = async () => {
    if (!title) {
      alert("Please provide an Assessment Title first.");
      return;
    }
    setLoadingAuto(true);
    try {
      // Seed questions automatically based on selected category & count
      const generatedQuestions = [];
      for (let i = 1; i <= autoConfig.count; i++) {
        if (type === 'APTITUDE') {
          generatedQuestions.push({
            text: `[Auto-Generated ${autoConfig.difficulty}] Sample question #${i} for ${autoConfig.category}: What is the logical outcome or result?`,
            category: autoConfig.category,
            type: 'MCQ',
            options: ['A) Option Alpha', 'B) Option Beta', 'C) Option Gamma', 'D) Option Delta'],
            answer: 'A',
            starterCode: { java: '', cpp: '', python: '' }
          });
        } else {
          generatedQuestions.push({
            text: `[Auto-Generated ${autoConfig.difficulty}] Implement an optimized algorithm to solve standard ${autoConfig.category} problem statement #${i}.`,
            category: autoConfig.category,
            type: 'CODING',
            options: [],
            answer: '',
            starterCode: {
              java: `public class Solution {\n    // Solve ${autoConfig.category} problem here\n    public static void main(String[] args) {\n        System.out.println("Running Test");\n    }\n}`,
              cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solve ${autoConfig.category} problem here\n    return 0;\n}`,
              python: `# Solve ${autoConfig.category} problem here\ndef solve():\n    pass`
            }
          });
        }
      }

      const payload = {
        title,
        type,
        durationMinutes: autoConfig.count * 4,
        questions: generatedQuestions
      };

      await axios.post('http://localhost:8080/api/assessments/create', payload, { withCredentials: true });
      setSuccess(true);
      setMsgText(`Successfully Auto-Generated and Published ${autoConfig.count} Questions for ${autoConfig.category}!`);
      setTitle('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Auto-generation failed", err);
      alert("Failed to auto-generate questions.");
    } finally {
      setLoadingAuto(false);
    }
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 4, p: 4, maxWidth: 950, mx: 'auto', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Quiz fontSize="large" /> Assessment & Test Studio
        </Typography>
        <ToggleButtonGroup
          value={creationMode}
          exclusive
          onChange={(e, newMode) => newMode && setCreationMode(newMode)}
          size="small"
        >
          <ToggleButton value="manual" sx={{ fontWeight: 'bold', px: 3 }}>
            <EditNote sx={{ mr: 1 }} /> Manual Add
          </ToggleButton>
          <ToggleButton value="auto" sx={{ fontWeight: 'bold', px: 3 }}>
            <AutoAwesome sx={{ mr: 1 }} /> Auto / AI Generate
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{msgText}</Alert>}

      {/* COMMON CONFIG FIELDS */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField 
          label="Assessment Title" 
          fullWidth 
          required 
          placeholder="e.g., TCS NQT Placement Aptitude & DSA Challenge"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Assessment Domain</InputLabel>
              <Select value={type} label="Assessment Domain" onChange={(e) => setType(e.target.value)}>
                <MenuItem value="APTITUDE">Aptitude, Logical & Verbal Reasoning</MenuItem>
                <MenuItem value="CODING">Data Structures & Algorithms (Coding)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              label="Duration (Minutes)" 
              type="number" 
              fullWidth 
              required 
              value={durationMinutes} 
              onChange={(e) => setDurationMinutes(Number(e.target.value))} 
            />
          </Grid>
        </Grid>
      </Stack>

      {/* --- MODE 1: AUTO / AI GENERATION CONFIGURATION --- */}
      {creationMode === 'auto' ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 4, bgcolor: '#f0f4f8', border: '1px dashed #1976d2' }}>
          <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome /> Automated Question Bank Generator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select your target company domain and question parameters. Our engine will instantly generate standardized questions across specified categories.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category / Topic</InputLabel>
                <Select 
                  value={autoConfig.category} 
                  label="Category / Topic" 
                  onChange={(e) => setAutoConfig({...autoConfig, category: e.target.value})}
                >
                  {type === 'APTITUDE' ? (
                    <>
                      <MenuItem value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>
                      <MenuItem value="Logical Reasoning">Logical Reasoning</MenuItem>
                      <MenuItem value="Verbal Ability">Verbal Ability & English</MenuItem>
                      <MenuItem value="Data Interpretation">Data Interpretation</MenuItem>
                      <MenuItem value="Fill in the Blanks & Grammar">Fill in the Blanks & Grammar</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="Arrays & Strings">Arrays & Strings</MenuItem>
                      <MenuItem value="Linked Lists">Linked Lists</MenuItem>
                      <MenuItem value="Stacks & Queues">Stacks & Queues</MenuItem>
                      <MenuItem value="Trees & Graphs">Trees & Graphs</MenuItem>
                      <MenuItem value="Dynamic Programming">Dynamic Programming</MenuItem>
                      <MenuItem value="Sorting & Searching">Sorting & Searching</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select 
                  value={autoConfig.difficulty} 
                  label="Difficulty Level" 
                  onChange={(e) => setAutoConfig({...autoConfig, difficulty: e.target.value})}
                >
                  <MenuItem value="Easy">Easy (Service-based MNCs)</MenuItem>
                  <MenuItem value="Medium">Medium (Product-based standard)</MenuItem>
                  <MenuItem value="Hard">Hard (FAANG Level)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField 
                label="Number of Questions" 
                type="number" 
                fullWidth 
                inputProps={{ min: 1, max: 25 }}
                value={autoConfig.count} 
                onChange={(e) => setAutoConfig({...autoConfig, count: Number(e.target.value)})} 
              />
            </Grid>
          </Grid>

          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleAutoGenerate} 
            disabled={loadingAuto}
            sx={{ py: 1.8, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 3 }}
            startIcon={<AutoAwesome />}
          >
            {loadingAuto ? <CircularProgress size={24} color="inherit" /> : `Auto-Generate & Publish ${autoConfig.count} Questions`}
          </Button>
        </Paper>
      ) : (
        /* --- MODE 2: MANUAL CREATION FORM --- */
        <form onSubmit={handleSaveAssessment}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Manual Question Builder</Typography>
              <Chip label={`Total Questions: ${questions.length}`} color="primary" sx={{ fontWeight: 'bold' }} />
            </Box>
            
            {questions.map((q, qIndex) => (
              <Paper key={qIndex} elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">Question #{qIndex + 1}</Typography>
                  {questions.length > 1 && (
                    <Button color="error" size="small" startIcon={<Delete />} onClick={() => removeQuestionField(qIndex)}>
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sub-Category</InputLabel>
                      <Select 
                        value={q.category} 
                        label="Sub-Category" 
                        onChange={(e) => handleQuestionChange(qIndex, 'category', e.target.value)}
                      >
                        {type === 'APTITUDE' ? (
                          <>
                            <MenuItem value="Quantitative Aptitude">Quantitative Aptitude</MenuItem>
                            <MenuItem value="Logical Reasoning">Logical Reasoning</MenuItem>
                            <MenuItem value="Verbal Ability">Verbal Ability & Grammar</MenuItem>
                            <MenuItem value="Data Interpretation">Data Interpretation</MenuItem>
                          </>
                        ) : (
                          <>
                            <MenuItem value="Arrays & Strings">Arrays & Strings</MenuItem>
                            <MenuItem value="Linked Lists">Linked Lists</MenuItem>
                            <MenuItem value="Stacks & Queues">Stacks & Queues</MenuItem>
                            <MenuItem value="Trees & Graphs">Trees & Graphs</MenuItem>
                            <MenuItem value="Dynamic Programming">Dynamic Programming</MenuItem>
                          </>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <TextField 
                  label="Question Statement / Problem Description" 
                  fullWidth 
                  required 
                  multiline 
                  rows={2} 
                  value={q.text} 
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} 
                  sx={{ mb: 2 }} 
                />

                {type === 'APTITUDE' ? (
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">Options (Provide text for A, B, C, D)</Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
                      {q.options.map((opt, oIndex) => (
                        <Grid item xs={12} sm={6} key={oIndex}>
                          <TextField 
                            label={`Option ${String.fromCharCode(65 + oIndex)}`} 
                            fullWidth 
                            size="small"
                            value={opt} 
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} 
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <TextField 
                      label="Correct Answer Letter (e.g., A, B, C, or D)" 
                      fullWidth 
                      size="small"
                      value={q.answer} 
                      onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)} 
                    />
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                      Starter Template Codes (C++, Java, Python)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField 
                          label="C++ Starter Code" 
                          fullWidth 
                          multiline 
                          rows={3} 
                          value={q.starterCode?.cpp || ''} 
                          onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, cpp: e.target.value })} 
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField 
                          label="Java Starter Code" 
                          fullWidth 
                          multiline 
                          rows={3} 
                          value={q.starterCode?.java || ''} 
                          onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, java: e.target.value })} 
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField 
                          label="Python Starter Code" 
                          fullWidth 
                          multiline 
                          rows={3} 
                          value={q.starterCode?.python || ''} 
                          onChange={(e) => handleQuestionChange(qIndex, 'starterCode', { ...q.starterCode, python: e.target.value })} 
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            ))}

            <Button 
              variant="outlined" 
              startIcon={<AddCircle />} 
              onClick={addQuestionField} 
              sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
            >
              Add Another Question Manually
            </Button>
            
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              sx={{ py: 1.8, borderRadius: 3, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Publish Manual Assessment
            </Button>
          </Stack>
        </form>
      )}
    </Card>
  );
}

export default AdminAssessmentManager;