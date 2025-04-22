import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Helper to format 24-hour time to 12-hour format
const formatTimeTo12Hour = (time24) => {
  const [hour, minute] = time24.split(":");
  const date = new Date();
  date.setHours(+hour);
  date.setMinutes(+minute);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const doctorsRef = collection(db, "doctors");
          const q = query(doctorsRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setDoctor(querySnapshot.docs[0].data());
          } else {
            console.warn("No matching doctor document found for UID.");
          }
        } catch (error) {
          console.error("Error fetching doctor:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // No user is signed in
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) return <CircularProgress color="inherit" />;
  if (!doctor) return <Typography>No doctor data found.</Typography>;

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card
        sx={{
          background: "linear-gradient(135deg, #2e335a, #1c1b2e)",
          color: "white",
          borderRadius: "20px",
          padding: "2.5rem",
          maxWidth: 500,
          width: "100%",
          boxShadow: 8,
        }}
      >
        <CardContent>
          <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item>
              <Avatar
                alt="Doctor Profile"
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${doctor.name}`}
                sx={{ width: 110, height: 110, border: "4px solid #7f5af0" }}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="h4"
                align="center"
                sx={{ fontWeight: 700, letterSpacing: "0.5px" }}
              >
                Dr. {doctor.name}
              </Typography>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ color: "#b0b0b0", fontStyle: "italic", mt: 1 }}
              >
                {doctor.email}
              </Typography>
            </Grid>

            <Grid item container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                  <MedicalServicesIcon sx={{ mr: 1, color: "#7f5af0" }} />
                  <strong>Specialty:</strong>&nbsp;{doctor.type}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: "#7f5af0" }} />
                  <strong>Available Days:</strong>
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    pl: 5,
                  }}
                >
                  {doctor.availableDays.map((day, index) => (
                    <Typography key={index} variant="body1" sx={{ minWidth: "100px" }}>
                      • {day}
                    </Typography>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: "#7f5af0" }} />
                  <strong>Available Times:</strong>
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    pl: 5,
                  }}
                >
                  {[...doctor.availableTimes]
                    .sort((a, b) => {
                      const [aH, aM] = a.split(":").map(Number);
                      const [bH, bM] = b.split(":").map(Number);
                      return aH === bH ? aM - bM : aH - bH;
                    })
                    .map((time, index) => (
                      <Typography key={index} variant="body1" sx={{ minWidth: "100px" }}>
                        • {formatTimeTo12Hour(time)}
                      </Typography>
                    ))}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorDashboard;
