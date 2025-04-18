import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import './StudentDashboard.css';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { Person as PersonIcon, CalendarToday as CalendarIcon, ListAlt as AppointmentsIcon, ExitToApp as LogoutIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const StudentDashboard = () => {
  const [timePreference, setTimePreference] = useState("");
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("profile");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  const [complaints, setComplaints] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [presentIllness, setPresentIllness] = useState("");
  const [pastMedicalHistory, setPastMedicalHistory] = useState("");
  const [familyHealthHistory, setFamilyHealthHistory] = useState("");

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  const fetchUserInfo = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserInfo(data);
        setName(data.name);
        setBirthDate(data.birthDate);
        setAge(data.age);
        setGender(data.gender);
        setContactNumber(data.contactNumber);
        setHomeAddress(data.homeAddress);
        setComplaints(data.complaints || "");
        setAllergies(data.allergies || "");
        setMedications(data.medications || "");
        setPresentIllness(data.presentIllness || "");
        setPastMedicalHistory(data.pastMedicalHistory || "");
        setFamilyHealthHistory(data.familyHealthHistory || "");
        setView("profile");
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchAppointments(); // Fetch on load
  }, []);
  
  const fetchAppointments = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
  
    try {
      const snapshot = await getDoc(doc(db, "users", uid));
      if (!snapshot.exists()) return;
  
      const querySnapshot = await getDocs(
        collection(db, "appointments"),
      );
      
      const userAppointments = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentId === uid) {
          userAppointments.push({ id: doc.id, ...data });
        }
      });
  
      userAppointments.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()); // newest first
      setAppointments(userAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };  

  const handleDateSelect = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time for accurate comparison
  
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
  
    // Block past dates
    if (selected < today) {
      alert("Please select a valid date. You cannot book appointments for past days.");
      return;
    }
  
    // Block weekends
    const day = date.getDay();
    if (day === 0 || day === 6) {
      alert("Clinic is closed on weekends.");
      return;
    }
  
    setSelectedDate(date);
    setTimePreference("");
    setOpenAppointmentDialog(true);
  };  

  const handleCloseAppointmentDialog = () => {
    setOpenAppointmentDialog(false);
  };

  const handleSubmitAppointmentRequest = async () => {
    if (!complaints.trim()) {
      alert("Please fill in your complaint first in your profile.");
      return;
    }
  
    if (!timePreference) {
      alert("Please select a time preference.");
      return;
    }
  
    setLoading(true);
    const uid = auth.currentUser?.uid;
  
    const appointmentData = {
      date: selectedDate,
      timePreference,
      reason: complaints,
      status: "Pending",
      studentId: uid,
      createdAt: new Date(),
    };
  
    try {
      const docRef = doc(db, "appointments", `${uid}_${selectedDate.toISOString()}`);
      await setDoc(docRef, appointmentData);
  
      // Also update user complaints with the submitted one
      await updateDoc(doc(db, "users", uid), { complaints });
  
      alert("Your appointment request has been submitted!");
      handleCloseAppointmentDialog();
    } catch (error) {
      console.error("Error submitting appointment:", error);
      alert("Error submitting appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };  

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!userInfo) return;

    setLoading(true);
    const uid = auth.currentUser?.uid;

    const updatedUserInfo = {
      ...userInfo,
      name,
      birthDate,
      age,
      gender,
      contactNumber,
      homeAddress,
      complaints,
      allergies,
      medications,
      presentIllness,
      pastMedicalHistory,
      familyHealthHistory,
    };

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, updatedUserInfo);
      setUserInfo(updatedUserInfo);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Student Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: 100,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            backgroundColor: "rgba(44, 62, 80, 0.8)",  // Slightly transparent dark background
            color: "rgba(255, 255, 255, 0.85)",  // Lighter text for better contrast
          },
        }}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <Box sx={{ height: "100%", backgroundColor: "transparent" }}>
        <List>
          <ListItem
            button
            onClick={() => setView("profile")}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",  // Light hover effect
              },
            }}
          >
            <PersonIcon sx={{ mr: 2 }} />  {/* Icon for Profile */}
            <ListItemText primary="Profile" />
          </ListItem>

          <ListItem
            button
            onClick={() => setView("calendar")}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",  // Light hover effect
              },
            }}
          >
            <CalendarIcon sx={{ mr: 2 }} />  {/* Icon for Schedule Appointment */}
            <ListItemText primary="Schedule Appointment" />
          </ListItem>

          <ListItem
            button
            onClick={() => setView("appointments")}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",  // Light hover effect
              },
            }}
          >
            <AppointmentsIcon sx={{ mr: 2 }} />  {/* Icon for My Appointments */}
            <ListItemText primary="My Appointments" />
          </ListItem>

          <Divider sx={{ backgroundColor: "#fff" }} />

          <ListItem
            button
            onClick={handleLogout}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",  // Light hover effect
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />  {/* Icon for Logout */}
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f4f6f8", height: "100vh", marginLeft: 1 }}>
        <Toolbar />

        {view === "calendar" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Select a date to request an appointment:
            </Typography>
            <Calendar 
              onClickDay={handleDateSelect} 
              value={selectedDate} 
              className="react-calendar"  // Add this to apply custom styles
            />
          </Box>
        )}

        {view === "profile" && userInfo && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
            <Avatar
              src={userInfo.profilePictureUrl || "https://www.example.com/default-avatar.png"}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h6">{name}</Typography>

            {/* Profile & Clinical Details Side-by-Side */}
            <Grid container spacing={4} sx={{ width: "100%", mt: 4 }}>
              {/* Profile Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Profile Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Birthdate" fullWidth value={birthDate} onChange={(e) => setBirthDate(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Age" fullWidth value={age} onChange={(e) => setAge(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Gender" fullWidth value={gender} onChange={(e) => setGender(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Contact Number" fullWidth value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Home Address" fullWidth value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} disabled={!editMode} />
                  </Grid>
                </Grid>
              </Grid>

              {/* Clinical Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Clinical Details
                </Typography>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    label="Complaints" 
                    fullWidth 
                    value={complaints} 
                    onChange={(e) => setComplaints(e.target.value)} 
                    disabled={!editMode || true} // Always disable complaints field when editing
                  />
                </Grid>
                  <Grid item xs={12}>
                    <TextField label="Allergies" fullWidth value={allergies} onChange={(e) => setAllergies(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Medications" fullWidth value={medications} onChange={(e) => setMedications(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="History of Present Illness" fullWidth value={presentIllness} onChange={(e) => setPresentIllness(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Past Medical History" fullWidth value={pastMedicalHistory} onChange={(e) => setPastMedicalHistory(e.target.value)} disabled={!editMode} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Family Health History" fullWidth value={familyHealthHistory} onChange={(e) => setFamilyHealthHistory(e.target.value)} disabled={!editMode} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Edit/Save Button */}
            <Box sx={{ mt: 4 }}>
              {!editMode ? (
                <Button onClick={handleEditProfile} color="primary" variant="contained">
                  Edit Profile
                </Button>
              ) : (
                <Button onClick={handleSaveProfile} color="primary" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
              )}
            </Box>
          </Box>
        )}

        {view === "appointments" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              My Appointments
            </Typography>

            <Grid container spacing={3}>
              {appointments.length === 0 ? (
                <Typography sx={{ mt: 2 }}>You have no appointment requests.</Typography>
              ) : (
                appointments.map((appt) => (
                  <Grid item xs={12} md={6} lg={4} key={appt.id}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: 3,
                        bgcolor: "white",
                        borderLeft: `5px solid ${
                          appt.status === "Pending"
                            ? "#fbc02d"
                            : appt.status === "Approved"
                            ? "#2e7d32"
                            : "#d32f2f"
                        }`,
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Date:</strong> {new Date(appt.date.seconds * 1000).toDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Time Preference:</strong> {appt.timePreference}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {appt.reason}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        <strong>Status:</strong> {appt.status}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Requested on: {new Date(appt.createdAt.seconds * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}
      </Box>

      <Dialog open={openAppointmentDialog} onClose={handleCloseAppointmentDialog}>
        <DialogTitle>Request Appointment</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 2,
            pb: 5,
          }}
        >
          <Typography>
            Selected Date: <strong>{selectedDate.toDateString()}</strong>
          </Typography>

          {/* Show complaint from profile */}
          <TextField
            label="Reason / Complaint"
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            fullWidth
            multiline
          />

          <TextField
            select
            label="Preferred Time"
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitAppointmentRequest} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
