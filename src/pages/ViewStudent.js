import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Avatar, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, Button, Grid, Autocomplete
} from "@mui/material";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

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
      setDisplayedUsers(filtered); // Initially show all
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
      Object.values(user)
        .some(val =>
          val &&
          val.toString().toLowerCase().includes(lower)
        )
    );
    setDisplayedUsers(filtered);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          freeSolo
          options={filteredUsers}
          getOptionLabel={(option) => option.name || ""}
          onInputChange={(e, value) => handleSearch(value)}
          onChange={(e, value) => value && handleCardClick(value)}
          renderInput={(params) => (
            <TextField {...params} label="Search student..." fullWidth variant="outlined" />
          )}
          renderOption={(props, option) => {
            const nameMatch = option.name.toLowerCase().includes(searchTerm.toLowerCase());
            return (
              <li {...props}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: nameMatch ? "bold" : "normal" }}>
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Age: {option.age}, Birthdate: {new Date(option.birthDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </li>
            );
          }}
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
        {displayedUsers.map((user) => (
          <Card
            key={user.id}
            sx={{ maxWidth: 345, cursor: "pointer", transition: "0.3s", "&:hover": { boxShadow: 6 } }}
            onClick={() => handleCardClick(user)}
          >
            <CardContent>
              <Avatar src={user.profilePictureUrl} sx={{ width: 60, height: 60, mb: 2 }} />
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="subtitle1" color="textSecondary">{user.email}</Typography>
              <Typography variant="body2" color="textSecondary">Age: {user.age}</Typography>
              <Typography variant="body2" color="textSecondary">
                Birthdate: {new Date(user.birthDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={!!selectedUser} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Student Info</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {[
                "name", "age", "birthDate", "gender", "email", "contactNumber", "homeAddress",
                "complaints", "presentIllness", "pastMedicalHistory", "medications",
                "allergies", "familyHealthHistory"
              ].map(field => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    fullWidth
                    multiline={["complaints", "presentIllness", "pastMedicalHistory", "medications", "allergies", "familyHealthHistory"].includes(field)}
                    rows={field === "homeAddress" ? 2 : 1}
                    type={field === "age" ? "number" : field === "birthDate" ? "date" : "text"}
                    value={field === "birthDate" && editedUser[field]
                      ? new Date(editedUser[field]).toISOString().split("T")[0]
                      : editedUser[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    InputLabelProps={field === "birthDate" ? { shrink: true } : {}}
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
