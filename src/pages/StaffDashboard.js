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

import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';


import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
} from '@mui/material';

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
            <Typography variant="h5" gutterBottom>Staff Calendar</Typography>
            <CalendarView selectedDate={selectedDate} date={calendarDate} />
          </Box>
        );
      case "profile":
        return profile ? (
          <Box>
            <Typography variant="h5" gutterBottom>Profile</Typography>
            <Typography variant="h6">Name: {profile.name}</Typography>
            <Typography variant="h6">Age: {profile.age}</Typography>
            <Typography variant="h6">Birthdate: {profile.birthDate}</Typography>
          </Box>
        ) : (
          <Typography variant="h6">Loading profile...</Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        open={isDrawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#2c3e50',
            color: 'white',
            paddingTop: '20px',
          },
        }}
      >
        <IconButton onClick={toggleDrawer} sx={{ color: 'white', ml: 1, mb: 1 }}>
          <MenuIcon />
        </IconButton>
      <List>
        {[
          { text: 'Profile', section: 'profile' },
          { text: 'Add Doctor/Dentist', section: 'doctor' },
          { text: 'Add Vaccine', section: 'vaccine' },
          { text: 'View Appointments', section: 'appointments' },
          { text: 'Logout', action: handleLogout }
        ].map((item, index, array) => (
          <React.Fragment key={index}>
            <ListItem
              button
              onClick={() =>
                item.action ? item.action() : setSelectedSection(item.section)
              }
              sx={{
                '&:hover': {
                  backgroundColor: '#34495e',
                },
                paddingY: 1,
                paddingX: 2,
              }}
            >
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: { color: 'white', fontWeight: 500 },
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
            backgroundColor: '#ecf0f1',
            minHeight: '100vh',
          }}
        >
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
          >
            {notifications.length > 0 ? (
              notifications.map((appointment, index) => (
                <MenuItem key={index} onClick={() => handleAppointmentSelect(appointment)}>
                  {appointment.studentName || 'Unknown'} requested on {appointment.date?.toDate().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} ({appointment.timePreference})
                </MenuItem>
              ))
            ) : (
              <MenuItem>No new requests</MenuItem>
            )}
          </Menu>
        </Box>
        <Typography variant="h4" gutterBottom sx={{ color: '#34495e' }}>
          Staff Dashboard
        </Typography>

        <Typography variant="body1" gutterBottom sx={{ color: '#7f8c8d' }}>
          Welcome, staff! Use the menu to manage data.
        </Typography>
        {renderSection()}
      </Box>
    </Box>
  );
};

export default StaffDashboard;
