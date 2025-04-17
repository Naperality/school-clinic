import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar"); // 'calendar' or 'profile'
  const [userInfo, setUserInfo] = useState(null);

  // Sidebar toggle
  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  const fetchUserInfo = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const userRef = doc(db, "students", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserInfo(docSnap.data());
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    alert(`You selected ${date.toDateString()} to request an appointment.`);
    // Later: open a form/modal to send the request to Firebase
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>Student Dashboard</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ height: "100%", backgroundColor: "#2C3E50" }}>
          <List>
            <ListItem button onClick={() => setView("profile")}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={() => setView("calendar")}>
              <ListItemText primary="Calendar" />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, bgcolor: "#f4f6f8", height: "100vh", marginLeft: 30 }}
      >
        <Toolbar />

        {view === "calendar" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Select a date to request an appointment:
            </Typography>
            <Calendar onClickDay={handleDateSelect} value={selectedDate} />
          </Box>
        )}

        {view === "profile" && userInfo && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
            <Avatar
              src={userInfo.profilePictureUrl}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h6">{userInfo.name}</Typography>
            <Typography>Age: {userInfo.age}</Typography>
            <Typography>Birth Year: {userInfo.birthYear}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudentDashboard;
