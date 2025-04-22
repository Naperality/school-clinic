import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const DoctorMedications = ({ currentDoctor }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [medicalLogs, setMedicalLogs] = useState([]);
  const [openAdministerDialog, setOpenAdministerDialog] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "appointments"),
          where("status", "==", "Approved"),
          where("doctor", "==", currentDoctor)
        );

        const querySnapshot = await getDocs(q);
        const appointmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const updatedAppointments = appointmentsData.map((appointment) => {
          const currentDate = new Date();
          const confirmedTime = appointment.confirmedTime
            ? new Date(appointment.confirmedTime.seconds * 1000)
            : null;

          if (confirmedTime) {
            const timeDiff = currentDate - confirmedTime;
            if (timeDiff > 2 * 60 * 60 * 1000) {
              updateDoc(doc(db, "appointments", appointment.id), {
                status: "Disapproved",
              });
            }
          }

          return {
            ...appointment,
            isClickable:
              confirmedTime && isSameDay(currentDate, confirmedTime),
          };
        });

        setAppointments(updatedAppointments);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    if (currentDoctor) {
      fetchAppointments();
    }
  }, [currentDoctor]);

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleCardClick = async (appointment) => {
    if (!appointment.isClickable) return;

    setSelectedAppointment(appointment);
    setOpenDialog(true);

    try {
      const userDocRef = doc(db, "users", appointment.studentId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        setSelectedUser(userSnapshot.data());
      } else {
        setSelectedUser(null);
      }

      const medQuery = query(
        collection(db, "medical"),
        where("studentId", "==", appointment.studentId)
      );
      const medSnapshot = await getDocs(medQuery);
      const logs = medSnapshot.docs.map((doc) => doc.data());
      setMedicalLogs(logs);
    } catch (err) {
      console.error("Failed to fetch user or medical data:", err);
      setSelectedUser(null);
      setMedicalLogs([]);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setMedicalLogs([]);
    setSelectedUser(null);
  };

  const handleSubmitMedication = async () => {
    try {
      await addDoc(collection(db, "medical"), {
        doctor: currentDoctor,
        medication: newMedication,
        notes: newNote,
        studentId: selectedAppointment.studentId,
        timestamp: new Date(),
      });
      setNewMedication("");
      setNewNote("");
      setOpenAdministerDialog(false);
      // Refresh logs after adding
      const medQuery = query(
        collection(db, "medical"),
        where("studentId", "==", selectedAppointment.studentId)
      );
      const medSnapshot = await getDocs(medQuery);
      const logs = medSnapshot.docs.map((doc) => doc.data());
      setMedicalLogs(logs);
    } catch (err) {
      console.error("Failed to submit medication:", err);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>{error}</Typography>;

  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Approved Appointments
      </Typography>
      <Grid container spacing={3}>
        {appointments.map((appointment) => (
          <Grid item xs={12} sm={6} md={4} key={appointment.id}>
            <Card
              sx={{
                background: "rgba(30, 41, 59, 0.6)",
                backdropFilter: "blur(8px)",
                color: "white",
                borderRadius: 3,
                boxShadow: 3,
                cursor: appointment.isClickable ? "pointer" : "not-allowed",
                transition: "0.3s",
                "&:hover": {
                  transform: appointment.isClickable ? "scale(1.05)" : "none",
                  boxShadow: appointment.isClickable ? 8 : 3,
                },
              }}
              onClick={() => handleCardClick(appointment)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: "#e0f2fe" }}>
                  {appointment.reason}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>
                  {appointment.timePreference}
                </Typography>
                <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                  Date:{" "}
                  {appointment.start
                    ? new Date(
                        appointment.start.seconds * 1000
                      ).toDateString()
                    : appointment.confirmedTime
                    ? new Date(
                        appointment.confirmedTime.seconds * 1000
                      ).toDateString()
                    : "No date available"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                  Requested on:{" "}
                  {new Date(
                    appointment.createdAt.seconds * 1000
                  ).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Student Info:
              </Typography>
              <Typography>Name: {selectedUser.name}</Typography>
              <Typography>Age: {selectedUser.age}</Typography>
              <Typography>Gender: {selectedUser.gender}</Typography>
              <Typography>Birthdate: {selectedUser.birthDate}</Typography>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>Contact Number: {selectedUser.contactNumber}</Typography>
              <Typography>Address: {selectedUser.homeAddress}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Health Info:
              </Typography>
              <Typography>Allergies: {selectedUser.allergies}</Typography>
              <Typography>Medications: {selectedUser.medications}</Typography>
              <Typography>Past Medical History: {selectedUser.pastMedicalHistory}</Typography>
              <Typography>Present Illness: {selectedUser.presentIllness}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Past Clinical Medications:
              </Typography>
              {medicalLogs.length > 0 ? (
                medicalLogs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      mt: 1,
                      mb: 1,
                      p: 1,
                      border: "1px solid #94a3b8",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">Doctor: {log.doctor}</Typography>
                    <Typography variant="body2">Medication: {log.medication}</Typography>
                    <Typography variant="body2">Notes: {log.notes}</Typography>
                    <Typography variant="caption" color="gray">
                      {new Date(log.timestamp.seconds * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography>No past medications found.</Typography>
              )}

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => setOpenAdministerDialog(true)}
              >
                Administer
              </Button>
            </>
          ) : (
            <Typography color="error">User info not available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Administer Medication Dialog */}
      <Dialog
        open={openAdministerDialog}
        onClose={() => setOpenAdministerDialog(false)}
      >
        <DialogTitle>Administer Medication</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Medication"
            fullWidth
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdministerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitMedication}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorMedications;
