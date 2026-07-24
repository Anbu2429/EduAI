import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

import {
  Avatar,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";

import {
  PhotoCamera,
  Save,
  School,
  CameraAlt,
  Close
} from "@mui/icons-material";

const API = "http://localhost:8080/api";
axios.defaults.withCredentials = true;

function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ===============================
  // CAMERA STATE & REFS
  // ===============================
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    getUserSession();
    // Cleanup camera on unmount if left open
    return () => stopCamera();
  }, []);

  const getUserSession = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`);
      setUserId(res.data.id);
      getProfile(res.data.id);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getProfile = async (id) => {
    try {
      const res = await axios.get(`${API}/student/profile/user/${id}`);
      setProfile(res.data);
      if (res.data.profilePhoto) {
        setPreview(`http://localhost:8080/uploads/profile/students/${res.data.profilePhoto}`);
      }
    } catch (error) {
      setProfile({
        user: { id: id },
        registerNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        department: "",
        year: "",
        semester: "",
        section: "",
        cgpa: "",
        skills: "",
        github: "",
        linkedin: "",
        portfolio: "",
        resume: "",
        bio: "",
        placementStatus: ""
      });
      message("Please fill out your details to create your profile.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const profileData = {
        user: { id: userId },
        registerNumber: profile.registerNumber,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        address: profile.address,
        department: profile.department,
        year: profile.year ? Number(profile.year) : 1,
        semester: profile.semester ? Number(profile.semester) : 1,
        section: profile.section,
        cgpa: profile.cgpa ? Number(profile.cgpa) : 0.0,
        skills: profile.skills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        resume: profile.resume,
        bio: profile.bio,
        placementStatus: profile.placementStatus
      };

      if (profile.id) {
        await axios.put(`${API}/student/profile/${profile.id}`, profileData);
        message("Profile Updated successfully", "success");
      } else {
        const res = await axios.post(`${API}/student/profile`, profileData);
        setProfile(res.data);
        message("Profile Created successfully", "success");
      }
    } catch (error) {
      console.log(error?.response);
      message(error?.response?.data?.message || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // IMAGE SELECTION (FILE)
  // ===============================
  const selectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ===============================
  // CAMERA LOGIC
  // ===============================
  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      message("Could not access camera. Please check permissions.", "error");
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set canvas size to video size
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Draw image to canvas
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Convert canvas to a File object
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setSelectedImage(file);
          setPreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  // ===============================
  // UPLOAD TO DATABASE
  // ===============================
  const uploadPhoto = async () => {
    if (!profile.id) return message("Save profile details first before uploading a photo.", "warning");
    if (!selectedImage) return message("Choose or take an image first", "warning");
    
    const data = new FormData();
    data.append("file", selectedImage);
    
    try {
      await axios.post(`${API}/student/profile/upload-photo/${profile.id}`, data);
      message("Photo uploaded to database successfully", "success");
      getProfile(userId);
    } catch (error) {
      message("Upload failed", "error");
    }
  };

  const message = (msg, type) => setSnackbar({ open: true, message: msg, severity: type });
  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  if (loading) return <Box height="80vh" display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>;
  if (!profile) return <Box sx={{ p: 4, textAlign: 'center', mt: 10 }}><Typography variant="h5" color="error">Authentication Required</Typography><Typography>Please log in to view your profile.</Typography></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>Student Profile</Typography>
      <Grid container spacing={3}>
        
        {/* LEFT COLUMN: Avatar & Photos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
            <Avatar src={preview} sx={{ width: 180, height: 180, mx: "auto", mb: 3 }}>
              {profile.firstName?.charAt(0) || "U"}
            </Avatar>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button component="label" variant="contained" fullWidth startIcon={<PhotoCamera />}>
                Choose File <input hidden type="file" accept="image/*" onChange={selectImage} />
              </Button>
              <Button variant="contained" color="secondary" fullWidth startIcon={<CameraAlt />} onClick={startCamera}>
                Live Photo
              </Button>
            </Box>

            <Button fullWidth variant="outlined" onClick={uploadPhoto}>Upload Selected Photo</Button>
            
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" fontWeight="bold">{profile.firstName || "New"} {profile.lastName || "Student"}</Typography>
            <Chip icon={<School />} label={profile.department || "No Dept"} sx={{ mt: 1 }} />
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" mb={3} fontWeight="bold">Personal Information</Typography>
              <Grid container spacing={3}>
                
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Register Number *" name="registerNumber" value={profile.registerNumber || ""} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email *" name="email" value={profile.email || ""} onChange={handleChange} />
                </Grid>

                {[["firstName", "First Name *"], ["lastName", "Last Name"], ["phone", "Phone"]].map((item) => (
                  <Grid item xs={12} md={4} key={item[0]}>
                    <TextField fullWidth label={item[1]} name={item[0]} value={profile[item[0]] || ""} onChange={handleChange} />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Address" name="address" value={profile.address || ""} onChange={handleChange} />
                </Grid>

                <Divider sx={{ width: "100%", my: 3 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ width: '100%', ml: 3 }}>Academic</Typography>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Department *" name="department" value={profile.department || ""} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Year *" name="year" type="number" value={profile.year || ""} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Semester *" name="semester" type="number" value={profile.semester || ""} onChange={handleChange} />
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<Save />} disabled={saving} onClick={saveProfile} sx={{ mt: 2 }}>
                    {saving ? "Saving..." : (profile.id ? "Update Profile" : "Create Profile")}
                  </Button>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CAMERA DIALOG MODAL */}
      <Dialog open={cameraOpen} onClose={stopCamera} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Take Live Photo
          <IconButton onClick={stopCamera}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" color="primary" onClick={capturePhoto} startIcon={<CameraAlt />} size="large">
            Capture Photo
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentProfile;