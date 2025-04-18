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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const vaccineTypes = [
    "Measles, Mumps, Rubella (MMR)",
    "Tetanus, Diphtheria, Pertussis (Tdap)",
    "Hepatitis B",
    "HPV (Human Papillomavirus)",
    "Influenza (Flu)",
    "Varicella (Chickenpox)",
    "Polio",
    "COVID-19"
  ];

const VaccineForm = () => {
  const [vaccineType, setVaccineType] = useState("");
  const [availableDate, setAvailableDate] = useState(null);

  const handleSubmit = async () => {
    if (!vaccineType || !availableDate) {
      alert("Please select both a vaccine type and a date.");
      return;
    }
  
    try {
      const vaccineRef = await addDoc(collection(db, "vaccines"), {
        type: vaccineType,
        availableDate,
      });
  
      try {
        const event = {
          title: `${vaccineType} Availability`,
          start: availableDate,
          end: availableDate,
          allDay: true,
          description: `${vaccineType} is available on this date.`,
          vaccineId: vaccineRef.id,
          status: "Available",
        };
  
        await addDoc(collection(db, "events"), event);
  
        setVaccineType("");
        setAvailableDate(null);
        alert("Vaccine and calendar event added successfully!");
      } catch (eventError) {
        console.error("Error adding calendar event:", eventError);
        alert("Vaccine was added, but failed to create calendar event.");
      }
    } catch (vaccineError) {
      console.error("Error adding vaccine:", vaccineError);
      alert("Failed to add vaccine.");
    }
  };  

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Vaccine
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Vaccine Type</InputLabel>
        <Select
          value={vaccineType}
          onChange={(e) => setVaccineType(e.target.value)}
        >
          {vaccineTypes.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Available Date"
          value={availableDate}
          onChange={(newValue) => setAvailableDate(newValue)}
          renderInput={(params) => (
            <TextField fullWidth margin="normal" {...params} />
          )}
        />
      </LocalizationProvider>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        fullWidth
        onClick={handleSubmit}
      >
        Add Vaccine
      </Button>
    </Box>
  );
};

export default VaccineForm;
