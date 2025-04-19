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
import AddCircleIcon from '@mui/icons-material/AddCircle';

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",  // Morning times
  "13:00", "14:00", "15:00", "16:00", "17:00"   // Afternoon times
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
    <Box sx={{
      maxWidth: 800,
      mx: "auto",
      mt: 4,
      p: 5,
      backgroundColor: "rgba(44, 62, 80, 0.8)", // more transparent than 0.9
      borderRadius: 3,
      boxShadow: 2
    }}>    
      {/* Doctor's Information Section */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "#ecf0f1", mb: 1, display: 'flex', alignItems: 'center', fontWeight: 600 }}
      >
       <span style={{ fontSize: '1.2rem', marginRight: 8 }}>
          <AddCircleIcon sx={{ color: 'linear-gradient(45deg, #ff6b6b, #f06595, #f0a500)', fontSize: '1.5rem' }} />
        </span>
        Add Doctor or Dentist
      </Typography>
  
      <Grid container spacing={2}>
        {/* First Section - Doctor's Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ color: "#ecf0f1", mb: 1 }}>
            Doctor's Information
          </Typography>
  
          <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: "#ecf0f1", '&.Mui-focused': { color: '#1abc9c' } }}>
            Type of Doctor
          </InputLabel>
          <Select
            value={doctorType}
            onChange={(e) => setDoctorType(e.target.value)}
            sx={{
              backgroundColor: "#34495e",
              color: "#ecf0f1",
              '& .MuiSelect-icon': { color: '#ecf0f1' },
              '&:hover': {
                backgroundColor: '#2c3e50',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1abc9c',
              },
              '&.Mui-focused': {
                backgroundColor: '#2c3e50',
                borderColor: '#1abc9c',
              }
            }}
          >
            {doctorTypes.map((type, index) => (
              <MenuItem key={index} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
  
          <TextField
            label="Doctor's Name"
            fullWidth
            margin="normal"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: '#bdc3c7' }, // label color
              '& .MuiInputLabel-root.Mui-focused': { color: '#1abc9c' }, // focused label
              '& .MuiOutlinedInput-root': {
                color: '#ecf0f1', // input text color
                backgroundColor: "#34495e",
                '& fieldset': { borderColor: '#7f8c8d' },
                '&:hover fieldset': { borderColor: '#ecf0f1' },
                '&.Mui-focused fieldset': { borderColor: '#1abc9c' }
              }
            }}
          />
        </Grid>
  
        {/* Second Section - Available Days */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ color: "#ecf0f1", mb: 1 }}>
            Available Days
          </Typography>
          {daysOfWeek.map((day, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                  sx={{ color: "#ecf0f1", '&.Mui-checked': { color: "#1abc9c" } }}
                />
              }
              label={<Typography sx={{ color: "#ecf0f1" }}>{day}</Typography>}
            />
          ))}
        </Grid>
  
        {/* Third Section - Available Times */}
        <Grid item xs={12} md={12}>
          <Typography variant="subtitle1" sx={{ color: "#ecf0f1", mb: 1 }}>
            Available Times
          </Typography>
          <Grid container spacing={2}>
            {/* Morning Times */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#ecf0f1" }}>Morning</Typography>
              {morningTimes.map((time, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedTimes.includes(time)}
                      onChange={() => handleTimeChange(time)}
                      sx={{ color: "#ecf0f1", '&.Mui-checked': { color: "#1abc9c" } }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#ecf0f1" }}>
                      {`${formatTime(time)} - ${formatTime(addOneHour(time))}`}
                    </Typography>
                  }
                />
              ))}
            </Grid>

            {/* Afternoon Times */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#ecf0f1" }}>Afternoon</Typography>
              {afternoonTimes.map((time, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedTimes.includes(time)}
                      onChange={() => handleTimeChange(time)}
                      sx={{ color: "#ecf0f1", '&.Mui-checked': { color: "#1abc9c" } }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#ecf0f1" }}>
                      {`${formatTime(time)} - ${formatTime(addOneHour(time))}`}
                    </Typography>
                  }
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
  
      <Button
        variant="contained"
        color="primary"
        sx={{
          mt: 2, 
          width: "100%", 
          padding: "12px 0", 
          backgroundColor: "#1abc9c", 
          '&:hover': { backgroundColor: "#16a085" },
        }}
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
