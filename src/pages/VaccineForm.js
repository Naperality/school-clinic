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
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        backgroundColor: "#34495e", // Dark background
        borderRadius: 2,
        color: "#fff", // White text
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Optional: Shadow for depth
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add Vaccine
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "#ecf0f1", '&.Mui-focused': { color: '#1abc9c' } }}>Vaccine Type</InputLabel>
        <Select
          value={vaccineType}
          onChange={(e) => setVaccineType(e.target.value)}
          sx={{
            backgroundColor: "rgba(44, 62, 80, 0.75)",
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
              borderColor: '#ecf0f1',
            }
          }}
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
        slotProps={{
          textField: {
            fullWidth: true,
            margin: "normal",
            sx: {
              "& .MuiInputBase-root": {
                backgroundColor: "#fff",
                color: "black",
              },
              "& .MuiInputBase-input": {
                color: "black",
              },
              "& .MuiInputLabel-root": {
                color: "black",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#1abc9c",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ccc",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1abc9c",
              },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1abc9c",
              },
            },
          },
          day: {
            sx: {
              color: "black",
              "&:hover": {
                backgroundColor: "#4caf50",
              },
              "&.Mui-selected": {
                backgroundColor: "#4caf50",
                color: "black",
              },
            },
          },
          popper: {
            sx: {
              // Outer paper container of the calendar
              "& .MuiPaper-root": {
                backgroundColor: "#1b2838",
                color: "#fff",
              },
              // Month/year label at the top
              "& .MuiPickersCalendarHeader-label": {
                color: "#fff",
              },
              // Navigation arrows (left/right)
              "& .MuiIconButton-root": {
                color: "#fff",
              },
              // Weekday headers (Mon, Tue, etc.)
              "& .MuiDayCalendar-weekDayLabel": {
                color: "#ccc",
              },
              // Entire grid area where dates are rendered
              "& .MuiDayCalendar-slideTransition": {
                backgroundColor: "#1b2838", // This fixes the actual calendar background
              },
            },
          }      
        }}
      />
    </LocalizationProvider>

      <Button
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          color: "#fff",
          backgroundColor: "#4caf50", // Green background
          "&:hover": {
            backgroundColor: "#45a049", // Darker green on hover
          },
        }}
        fullWidth
        onClick={handleSubmit}
      >
        Add Vaccine
      </Button>
    </Box>
  );
};

export default VaccineForm;
