import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  CssBaseline,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

// Internal views
import DoctorProfile from "./doctor/DoctorProfile";
import DoctorMedications from "./doctor/DoctorMedications";
import ViewStudents from "./doctor/ViewStudents";

const drawerWidth = 240;

const DoctorsDashboard = () => {
  const [selectedView, setSelectedView] = useState("profile");
  const [open, setOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleAppointmentSelect = () => {
    setAnchorEl(null);
    setSelectedView("appointments");
  };

  const handleCardClick = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedAppointment?.id) return;

    try {
      const docRef = doc(db, "appointments", selectedAppointment.id);
      await updateDoc(docRef, { status: newStatus });

      setOpenDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const doctorQuery = query(collection(db, "doctors"), where("uid", "==", user.uid));
        const doctorSnapshot = await getDocs(doctorQuery);

        if (!doctorSnapshot.empty) {
          const name = doctorSnapshot.docs[0].data().name;
          setDoctorName(name);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!doctorName) return;

    const unsubscribe = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const relevantAppointments = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((app) => app.doctor === doctorName && app.status === "Awaiting Confirmation");

      setNotifications(relevantAppointments);
      setUnreadCount(relevantAppointments.length);
      setAppointments(relevantAppointments);
    });

    return () => unsubscribe();
  }, [doctorName]);

  const menuItems = [
    { text: "Profile", icon: <AccountCircleIcon />, view: "profile" },
    { text: "Administer Medications/Vaccine", icon: <LocalHospitalIcon />, view: "medications" },
    { text: "View Student", icon: <GroupIcon />, view: "students" },
    { text: "View Appointments", icon: <NotificationsIcon />, view: "appointments" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#1f1f1f" }}>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>Doctor's Dashboard</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 70,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 70,
            backgroundColor: "#121212",
            color: "white",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <List sx={{ mt: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => setSelectedView(item.view)}
              sx={{ "&:hover": { backgroundColor: "#1f1f1f" } }}
            >
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemIcon
                  sx={{ color: "white", minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center" }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ style: { color: "white" } }}
                />
              )}
            </ListItem>
          ))}
          <ListItem
            button
            onClick={handleLogout}
            sx={{ mt: 2, "&:hover": { backgroundColor: "#1f1f1f" } }}
          >
            <Tooltip title={!open ? "Log out" : ""} placement="right">
              <ListItemIcon
                sx={{ color: "white", minWidth: 0, mr: open ? 2 : "auto", justifyContent: "center" }}
              >
                <LogoutIcon />
              </ListItemIcon>
            </Tooltip>
            {open && (
              <ListItemText
                primary="Log out"
                primaryTypographyProps={{ style: { color: "white" } }}
              />
            )}
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, color: "white", backgroundColor: "#181818", minHeight: "100vh" }}
      >
        <Toolbar />
        <Menu
          id="notification-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleNotificationClose}
        >
          {notifications.length > 0 ? (
            notifications.map((appt, idx) => (
              <MenuItem key={idx} onClick={() => handleAppointmentSelect(appt)}>
                {appt.date?.toDate().toLocaleDateString()} at {appt.timePreference} — {appt.reason || "No reason"}
              </MenuItem>
            ))
          ) : (
            <MenuItem>No new requests</MenuItem>
          )}
        </Menu>

        {selectedView === "profile" && <DoctorProfile />}
        {selectedView === "medications" && <DoctorMedications currentDoctor={doctorName} />}
        {selectedView === "students" && <ViewStudents />}
        {selectedView === "appointments" && (
          <Box>
            <Typography variant="h5" gutterBottom>My Appointments</Typography>
            <Grid container spacing={3}>
              {appointments.length === 0 ? (
                <Typography sx={{ mt: 2 }}>You have no appointment requests.</Typography>
              ) : (
                appointments.map((appt) => (
                  <Grid item xs={12} md={6} lg={4} key={appt.id}>
                    <Box
                      onClick={() => handleCardClick(appt)}
                      sx={{
                        p: 3,
                        color: 'black',
                        borderRadius: 3,
                        boxShadow: 3,
                        bgcolor: "white",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: 6,
                        },
                        borderLeft: `10px solid ${
                          appt.status === "Pending"
                            ? "#fbc02d"
                            : appt.status === "Approved"
                            ? "#2e7d32"
                            : appt.status === "Vaccine"
                            ? "#f8bbd0"
                            : appt.status === "Awaiting Confirmation"
                            ? "#ffe0b2"
                            : "#d32f2f"
                        }`,
                      }}
                    >
                      <Typography variant="subtitle1">
                        <strong>Date:</strong>{" "}
                        {appt.start
                          ? new Date(appt.start.seconds * 1000).toDateString()
                          : appt.confirmedTime
                          ? new Date(appt.confirmedTime.seconds * 1000).toDateString()
                          : appt.createdAt
                          ? new Date(appt.createdAt.seconds * 1000).toDateString()
                          : "No date available"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Time Preference:</strong> {appt.timePreference || "None"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {appt.reason || appt.status}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        <strong>Status:</strong>{" "}
                        {appt.status === "Vaccine" ? appt.note : appt.status}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Requested on:{" "}
                        {appt.createdAt
                          ? new Date(appt.createdAt.seconds * 1000).toLocaleString()
                          : "Unknown"}
                      </Typography>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}

        {/* 📌 Status Update Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Update Appointment Status</DialogTitle>
          <DialogContent>
            <Typography>
              Approve or disapprove the following appointment?
            </Typography>
            <Typography mt={2}>
              <strong>Reason:</strong> {selectedAppointment?.reason}
            </Typography>
            <Typography>
              <strong>Time Preference:</strong> {selectedAppointment?.timePreference}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleStatusUpdate("Approved")}>Approve</Button>
            <Button onClick={() => handleStatusUpdate("Disapproved")} color="error">
              Disapprove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DoctorsDashboard;
