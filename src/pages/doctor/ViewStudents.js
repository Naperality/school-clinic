import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Avatar, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, Button, Grid, Autocomplete
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ViewStudent = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const filtered = usersSnapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(user => user.role === "student");

      setFilteredUsers(filtered);
      setDisplayedUsers(filtered);
    };

    fetchStudents();
  }, []);

  const handleCardClick = (user) => {
    setSelectedUser(user);
    setEditedUser(user);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setEditedUser({});
  };

  const handleChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const userRef = doc(db, "users", editedUser.id);
    await updateDoc(userRef, editedUser);
    setSelectedUser(null);
  };

  const handleSearch = (inputValue) => {
    setSearchTerm(inputValue);
    const lower = inputValue.toLowerCase();
    const filtered = filteredUsers.filter(user =>
      Object.values(user).some(val =>
        val && val.toString().toLowerCase().includes(lower)
      )
    );
    setDisplayedUsers(filtered);
  };

  const fields = [
    "name", "age", "birthDate", "gender", "email", "contactNumber", "homeAddress",
    "complaints", "presentIllness", "pastMedicalHistory", "medications",
    "allergies", "familyHealthHistory"
  ];

  const multiLineFields = [
    "complaints", "presentIllness", "pastMedicalHistory",
    "medications", "allergies", "familyHealthHistory"
  ];

  return (
    <>
      <Box sx={{ mb: 3, px: 2 }}>
        <Autocomplete
          freeSolo
          options={filteredUsers}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(e, value) => handleSearch(value)}
          onChange={(e, value) => value && handleCardClick(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search student..."
              fullWidth
              variant="outlined"
              sx={{
                input: { color: "white" },
                "& label": { color: "#90caf9" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#1e293b",
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" }
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "white" }}>
                  {option.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Age: {option.age}, Birthdate: {new Date(option.birthDate).toLocaleDateString()}
                </Typography>
              </Box>
            </li>
          )}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 3,
          px: 2
        }}
      >
        {displayedUsers.map((user) => (
          <Card
            key={user.id}
            sx={{
              background: "rgba(30, 41, 59, 0.6)",
              backdropFilter: "blur(8px)",
              color: "white",
              borderRadius: 3,
              boxShadow: 3,
              transition: "0.3s",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: 8
              },
              cursor: "pointer"
            }}
            onClick={() => handleCardClick(user)}
          >
            <CardContent>
              <Avatar
                src={user.profilePictureUrl}
                sx={{ width: 60, height: 60, mb: 2, border: "2px solid #38bdf8" }}
              />
              <Typography variant="h6" sx={{ color: "#e0f2fe" }}>{user.name}</Typography>
              <Typography variant="subtitle2" sx={{ color: "#94a3b8" }}>{user.email}</Typography>
              <Typography variant="body2" sx={{ color: "#cbd5e1" }}>Age: {user.age}</Typography>
              <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                Birthdate: {new Date(user.birthDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={!!selectedUser}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(10px)",
            borderRadius: 4,
            color: "white"
          }
        }}
      >
        <DialogTitle>Edit Student Info</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    fullWidth
                    multiline={multiLineFields.includes(field)}
                    rows={field === "homeAddress" ? 2 : 1}
                    type={field === "age" ? "number" : field === "birthDate" ? "date" : "text"}
                    value={
                      field === "birthDate" && editedUser[field]
                        ? new Date(editedUser[field]).toISOString().split("T")[0]
                        : editedUser[field] || ""
                    }
                    onChange={(e) => handleChange(field, e.target.value)}
                    InputLabelProps={field === "birthDate" ? { shrink: true } : {}}
                    sx={{
                      "& input, & textarea": {
                        color: "white"
                      },
                      label: { color: "#93c5fd" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#1e293b",
                        "& fieldset": { borderColor: "#475569" },
                        "&:hover fieldset": { borderColor: "#38bdf8" },
                        "&.Mui-focused fieldset": { borderColor: "#38bdf8" }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error" variant="outlined">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewStudent;
