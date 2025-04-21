import React, { useState, useEffect } from 'react';
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import CalendarView from "./CalendarView";
import DoctorForm from "./DoctorForm";
import VaccineForm from "./VaccineForm";
import ViewStudent from "./ViewStudent";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import SearchIcon from '@mui/icons-material/Search';

import LogoutIcon from "@mui/icons-material/Logout";
import "./StaffDashboard.css";

import {
  Box,
  Card,
  Chip,
  Avatar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Toolbar,
  AppBar,
  CssBaseline,
} from "@mui/material";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [vaccineAvailability, setVaccineAvailability] = useState([]);
  const [calendarNotes, setCalendarNotes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // default open

  const [doctorName, setDoctorName] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [vaccineType, setVaccineType] = useState("");
  const [vaccineDates, setVaccineDates] = useState([]);
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState("profile");

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };  

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleAppointmentSelect = (appointment) => {
    const date = appointment.date?.toDate();
    if (date) {
      setSelectedDate(date);
      setCalendarDate(date); // This now controls the calendar view
    }
    setAnchorEl(null);
    setSelectedSection("appointments"); // Automatically switch to calendar view
  };

  useEffect(() => {
    const unsubscribeDoctors = onSnapshot(collection(db, "doctors"), (snapshot) => {
      const availability = snapshot.docs.map(doc => doc.data());
      setDoctorAvailability(availability);
    });

    const unsubscribeVaccines = onSnapshot(collection(db, "vaccines"), (snapshot) => {
      const availability = snapshot.docs.map(doc => doc.data());
      setVaccineAvailability(availability);
    });

    const unsubscribeAppointments = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const pending = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(appointment => appointment.status === "Pending");
      setNotifications(pending);
      setUnreadCount(pending.length);
    });

    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchProfile();

    return () => {
      unsubscribeDoctors();
      unsubscribeVaccines();
      unsubscribeAppointments();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login");
    });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (selectedDate && note) {
      const newNote = {
        date: selectedDate,
        note: note,
      };
      setCalendarNotes([...calendarNotes, newNote]);
      setNote("");
    }
  };

  const renderSection = () => {
    switch (selectedSection) {
      case "doctor":
        return <Box><DoctorForm /></Box>;
      case "vaccine":
        return <Box><VaccineForm /></Box>;
      case "appointments":
        return (
          <Box>
            <CalendarView selectedDate={selectedDate} date={calendarDate} />
          </Box>
        );
        case "profile":
          return profile ? (
            <Box sx={{ maxWidth: 750, mx: "auto", my: 3, p: 3, backgroundColor: "rgba(44, 62, 80, 0.8)", borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: "#ecf0f1", fontWeight: 600 }}>
                Profile
              </Typography>
        
              <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                <Avatar src="/admin-avatar.png" sx={{ width: 80, height: 80, borderRadius: 2, boxShadow: 2, mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "#ecf0f1", fontWeight: 500 }}>
                    {profile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bdc3c7", fontWeight: 400 }}>
                    Age: {profile.age}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#bdc3c7", fontWeight: 400 }}>
                    Birthdate: {new Date(profile.birthDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
        
              <Box display="flex" justifyContent="center" alignItems="center">
                <Chip label="Active" color="success" sx={{ mr: 1, fontWeight: 500 }} />
                <Chip label="Verified" color="primary" sx={{ fontWeight: 500 }} />
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" sx={{ color: "#bdc3c7" }}>Loading profile...</Typography>
          );
        case "viewStudents": // New case added for View Students/Patients
          return <Box><ViewStudent /></Box>;  // Rendering the ViewStudents component        
      default:
        return null;
    }
  };  

  const navItems = [
    { text: 'Profile', section: 'profile', icon: <PersonIcon /> },
    { text: 'Add Doctor/Dentist', section: 'doctor', icon: <LocalHospitalIcon /> },
    { text: 'Add Vaccine', section: 'vaccine', icon: <VaccinesIcon /> },
    { text: 'View Appointments', section: 'appointments', icon: <EventIcon /> },
    { text: 'View Students', section: 'viewStudents', icon: <SearchIcon  /> },
    { text: 'Logout', action: handleLogout, icon: <LogoutIcon /> }
  ];
  
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(44, 62, 80, 0.95)', // Slightly darker & opaque
            color: '#ecf0f1', // Light gray text for contrast
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Soft shadow
          }}
        >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Manager Dashboard
          </Typography>
          {/* Spacer to push the next icon to the right */}
          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Notifications" arrow>
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              aria-label="View notifications"
              aria-haspopup="true"
              aria-controls="notification-menu"
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
            MenuListProps={{
              'aria-labelledby': 'notification-button',
            }}
          ></Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(44, 62, 80, 0.8)',
            color: 'rgba(255, 255, 255, 0.85)',
          },
        }}
        >
        <Box sx={{ mt: 8 }}></Box>
        <List>
          {navItems.map((item, index, array) => (
            <React.Fragment key={index}>
              <ListItem
                button
                onClick={() =>
                  item.action ? item.action() : setSelectedSection(item.section)
                }
                sx={{
                  '&:hover': {
                    backgroundColor: '#2c3e50',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#34495e',
                  },
                  paddingY: 1,
                  paddingX: 3,
                  transition: '0.2s',
                }}
                selected={selectedSection === item.section}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: { fontWeight: 500 },
                  }}
                />
              </ListItem>
              {index !== array.length - 1 && (
                <Divider sx={{ backgroundColor: '#34495e' }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
  
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 4,
          minHeight: "100vh",
          color: "#ecf0f1",
          background: "#fff",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
          >
            {notifications.length > 0 ? (
              notifications.map((appointment, index) => (
                <MenuItem key={index} onClick={() => handleAppointmentSelect(appointment)}>
                  {appointment.studentName || 'Unknown'} requested on {appointment.date?.toDate().toLocaleDateString()} at {appointment.timePreference} — {appointment.reason || "No reason"}
                </MenuItem>
              ))
            ) : (
              <MenuItem>No new requests</MenuItem>
            )}
          </Menu>
        </Box>
          {/* Aesthetic Welcome Card */}
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(to right, #34495e, #2c3e50)',
            color: 'white',
            borderRadius: 4,
            boxShadow: 3,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome back, Manager 👋
            </Typography>
          </Box>

          <Avatar
            alt="Admin Avatar"
            src="/admin-avatar.png" // or remove src for initials
            sx={{ width: 72, height: 72, ml: 2 }}
          />
        </Card>
        {renderSection()}
      </Box>
    </Box>
  );
};

export default StaffDashboard;
