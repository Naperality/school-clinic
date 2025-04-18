import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const timeSlots = [
  "08:30", "09:30", "10:30", "11:30", "12:30",  // Morning times
  "13:30", "14:30", "15:30", "16:30", "17:30"   // Afternoon times
];

const doctorTypes = [
  "Pediatrics",
  "Internal Medicine",
  "Family Medicine",
  "Dentistry"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DoctorForm = () => {
  const [doctorType, setDoctorType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const handleTimeChange = (time) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!doctorType || !doctorName || selectedTimes.length === 0 || selectedDays.length === 0) {
      alert("Please fill in all fields and select at least one time and one day.");
      return;
    }

    try {
      await addDoc(collection(db, "doctors"), {
        type: doctorType,
        name: doctorName,
        availableTimes: selectedTimes,
        availableDays: selectedDays,  // Added days to the Firestore document
      });

      // Clear form
      setDoctorType("");
      setDoctorName("");
      setSelectedTimes([]);
      setSelectedDays([]);

      alert("Doctor added successfully!");
    } catch (error) {
      console.error("Error adding doctor: ", error);
      alert("Error adding doctor.");
    }
  };

  // Separate the time slots into morning and afternoon
  const morningTimes = timeSlots.slice(0, 5);
  const afternoonTimes = timeSlots.slice(5);

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Doctor or Dentist
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Type of Doctor</InputLabel>
        <Select
          value={doctorType}
          onChange={(e) => setDoctorType(e.target.value)}
        >
          {doctorTypes.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Doctor's Name"
        fullWidth
        margin="normal"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
      />

      <FormGroup>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Available Days
        </Typography>
        {daysOfWeek.map((day, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={selectedDays.includes(day)}
                onChange={() => handleDayChange(day)}
              />
            }
            label={day}
          />
        ))}
      </FormGroup>

      <FormGroup>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Available Times
        </Typography>
        <Grid container spacing={2}>
          {/* Morning Times */}
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Morning</Typography>
            {morningTimes.map((time, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={selectedTimes.includes(time)}
                    onChange={() => handleTimeChange(time)}
                  />
                }
                label={`${formatTime(time)} - ${formatTime(addOneHour(time))}`}
              />
            ))}
          </Grid>

          {/* Afternoon Times */}
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Afternoon</Typography>
            {afternoonTimes.map((time, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={selectedTimes.includes(time)}
                    onChange={() => handleTimeChange(time)}
                  />
                }
                label={`${formatTime(time)} - ${formatTime(addOneHour(time))}`}
              />
            ))}
          </Grid>
        </Grid>
      </FormGroup>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        fullWidth
        onClick={handleSubmit}
      >
        Add Doctor
      </Button>
    </Box>
  );
};

// Function to add one hour to the time
function addOneHour(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const newDate = new Date();
  newDate.setHours(hours + 1, minutes);
  return newDate.toTimeString().slice(0, 5);
}

// Function to format time in AM/PM format
function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;  // Convert hour to 12-hour format
  return `${hour12}:${minutes < 10 ? `0${minutes}` : minutes} ${period}`;
}

export default DoctorForm;
