import React, { useState, useEffect, useRef } from "react";
import {
  format,
  parse,
  startOfWeek,
  getDay
} from "date-fns";
import { enUS } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import {
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography
} from "@mui/material";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { deleteDoc } from "firebase/firestore";
import { Calendar as BigCalendar, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { firestore } from "../firebase"; // Adjust path based on where your firebase config is

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarView = ({ selectedDate }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [doctors, setDoctors] = useState([]);
  const [approvedAppointments, setApprovedAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState(availableTimes[0] || '');
  const [selectedDoctorType, setSelectedDoctorType] = useState("");

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserForVaccine, setSelectedUserForVaccine] = useState("");

  const calendarRef = useRef();

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (snapshot) => {
      const pendingList = [];
      const approvedList = [];
      const disapprovedList = [];
  
      const now = new Date();
  
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let status = data.status;
        const appointmentDate = new Date(data.date?.toDate());
  
        let startDate = new Date(appointmentDate);
        let endDate = new Date(appointmentDate);
  
        // If approved, use confirmed time
        if (status === "Approved" && data.confirmedTime?.toDate) {
          startDate = data.confirmedTime.toDate();
          endDate = new Date(startDate);
          endDate.setHours(startDate.getHours() + 1);
  
          // ✅ If time passed, mark as Done and update Firestore
          if (endDate < now) {
            status = "Done";
  
            const appointmentRef = doc(db, "appointments", docSnap.id);
            updateDoc(appointmentRef, {
              status: "Done"
            }).catch((err) => console.error("Error updating to Done:", err));
          }
        }
  
        // Create event object
        const event = {
          id: docSnap.id,
          title:
            status === "Approved"
              ? `Approved: ${data.reason}`
              : status === "Done"
              ? `Done: ${data.reason}`
              : `${status}: ${data.timePreference} - ${data.reason}`,
          start: startDate,
          end: endDate,
          allDay: status !== "Approved" && status !== "Done",
          note: data.reason,
          studentId: data.studentId,
          status: status,
          timePreference: data.timePreference,
          confirmedTime: data.confirmedTime?.toDate ? data.confirmedTime.toDate() : null,
          doctor: data.doctor,
          color: status === "Done" ? "blue" : undefined,
        };
  
        // Categorize
        if (status === "Pending") {
          pendingList.push(event);
        } else if (status === "Approved") {
          approvedList.push(event);
        } else if (status === "Disapproved") {
          disapprovedList.push(event);
        } else if (status === "Done") {
          approvedList.push(event); // Or move to a separate "doneList" if you want to split
        }
      });
  
      // Set events: include only notes from previous, rest from live snapshot
      setEvents((prev) => [
        ...prev.filter(e => e.status === "Note"),
        ...pendingList,
        ...approvedList,
        ...disapprovedList,
      ]);
  
      setApprovedAppointments(approvedList); // Could rename to something like `upcomingAndDone`
    });
  
    return () => unsubscribe();
  }, []);
  
  

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorSnapshot = await getDocs(collection(db, "doctors"));
      const doctorList = doctorSnapshot.docs.map((doc) => doc.data());
      setDoctors(doctorList);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      const notesSnapshot = await getDocs(collection(db, "notes"));
      const noteEvents = notesSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          start: data.start.toDate(),
          end: data.end.toDate(),
          allDay: true,
          note: data.note,
          status: "Note",
        };
      });
  
      // Add notes to state only if they don't already exist
      setEvents((prev) => {
        const uniqueNotes = noteEvents.filter((note) => !prev.some((event) => event.id === note.id));
        return [...uniqueNotes, ...prev];
      });
    };
  
    fetchNotes();
  }, []);  

  useEffect(() => {
    if (selectedDoctor && doctors.length > 0 && selectedEvent?.start) {
      const matchedDoctor = doctors.find(doc => doc.name === selectedDoctor);
      if (matchedDoctor && matchedDoctor.availableTimes) {
        const selectedDateStr = selectedEvent.start.toDateString();
        const bookedTimes = approvedAppointments
          .filter(app => app.doctor === selectedDoctor && new Date(app.confirmedTime).toDateString() === selectedDateStr)
          .map(app => new Date(app.confirmedTime).toTimeString().slice(0, 5));

        let filteredTimes = matchedDoctor.availableTimes.filter(time => !bookedTimes.includes(time));

        const timePref = selectedEvent.timePreference?.toLowerCase();
        if (timePref === "morning") {
          filteredTimes = filteredTimes.filter(time => {
            const [hour] = time.split(":").map(Number);
            return hour >= 8 && hour < 12;
          });
        } else if (timePref === "afternoon") {
          filteredTimes = filteredTimes.filter(time => {
            const [hour] = time.split(":").map(Number);
            return hour >= 12 && hour < 18;
          });
        }

        setAvailableTimes(filteredTimes.sort());
      } else {
        setAvailableTimes([]);
      }
    }
  }, [selectedDoctor, doctors, selectedEvent, approvedAppointments]);

  useEffect(() => {
    if (selectedEvent?.start && doctors.length > 0) {
      const dayOfWeek = new Date(selectedEvent.start).toLocaleDateString('en-US', { weekday: 'long' });
      const filtered = doctors.filter(doc =>
        doc.availableDays?.includes(dayOfWeek)
      );
      setFilteredDoctors(filtered);
    }
  }, [selectedEvent, doctors]);

  const handleSelectSlot = ({ start, end }) => {
    if (start < new Date()) return;
    const existingEvent = events.find(event => event.start.toDateString() === start.toDateString());
    if (!existingEvent) {
      setSelectedEvent({ start, end, note: "" });
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    const fetchVaccines = async () => {
      const vaccinesSnapshot = await getDocs(collection(db, "events"));
      const vaccineEvents = vaccinesSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        
        // Ensure the 'start' and 'end' fields are present and valid
        const start = data.start ? data.start.toDate() : null;  // Check if 'start' exists
        const end = data.end ? data.end.toDate() : null;        // Check if 'end' exists
  
        // Only create an event if both 'start' and 'end' are valid
        if (start && end) {
          return {
            id: docSnap.id,
            title: `Vaccine: ${data.title}`,  // Display vaccine type as the event title
            start: start,
            end: end,
            allDay: true,                    // Set to true if it's an all-day event
            vaccineType: data.description,          // Store the vaccine type in the event data
            status: "Vaccine",               // Set the status as 'Vaccine'
          };
        }
  
        // If start or end is missing, return null (to ignore this event)
        return null;
      }).filter(event => event !== null);  // Filter out any null events (missing start/end)
  
      // Add vaccines to state only if they don't already exist
      setEvents((prev) => {
        const uniqueVaccines = vaccineEvents.filter((vaccine) => !prev.some((event) => event.id === vaccine.id));
        return [...uniqueVaccines, ...prev];
      });
    };
  
    fetchVaccines();
  }, []);  

  useEffect(() => {
    const fetchStudents = async () => {
      // Get all users from the "users" collection
      const usersSnapshot = await getDocs(collection(db, "users"));
      
      // Filter out users where the role is "student"
      const filteredUsers = usersSnapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          return { id: docSnap.id, ...data };
        })
        .filter(user => user.role === "student");
  
      // Update state with the filtered list of students
      setFilteredUsers(filteredUsers);
    };
  
    fetchStudents();
  }, []);
  
  const handleEventClick = (event) => {
    // Always set selectedEvent to the clicked event
    setSelectedEvent(event);
  
    // If it's a "Note", allow it to show the delete option
    if (event.status === "Note") {
      setDialogOpen(true);
      setIsEditing(true); // You can set this to false if you don't want editing for notes
    } else {
      // For non-note events, proceed with the normal flow (like appointment approval)
      setDialogOpen(true);
      setIsEditing(true);
      setSelectedDoctor(event.doctor || "");
      const matchedDoctor = doctors.find(doc => doc.name === event.doctor);
      setSelectedDoctorType(matchedDoctor?.type || "");
      // Set selectedTime based on the confirmed time if the event is approved
      if (event.status === "Approved" && event.confirmedTime) {
        const hours = event.confirmedTime.getHours().toString().padStart(2, '0');
        const minutes = event.confirmedTime.getMinutes().toString().padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}`);
      }else {
        setSelectedTime(""); // In case the time is not set for the event
      }
    }
  };  

  const handleSaveNote = async () => {
    if (selectedEvent && newNote.trim() !== "") {
      const noteData = {
        title: `Note: ${newNote}`,
        note: newNote,
        start: selectedEvent.start,
        end: selectedEvent.end,
        status: "Note",
        createdAt: new Date(),
      };
  
      // Add note to Firestore
      const docRef = await addDoc(collection(db, "notes"), noteData);
  
      // Add note to events state directly, only if it doesn't already exist
      const newEvent = {
        ...noteData,
        id: docRef.id,
        allDay: true,
      };
  
      setEvents((prev) => {
        // Avoid duplicating the note if it's already in state
        if (!prev.find(event => event.id === docRef.id)) {
          return [...prev, newEvent];
        }
        return prev; // Don't add if the note is already in the state
      });
    }
  
    setSelectedEvent(null);
    setNewNote("");
    setDialogOpen(false);
  };

  const handleSubmitApproval = async () => {
    if (!selectedDoctor || !selectedTime) {
      alert("Please select both doctor and time.");
      return;
    }

    const updatedTime = new Date(selectedEvent.start);
    const [hoursStr, minutesStr] = selectedTime.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || "0", 10);

    if (isNaN(hours) || isNaN(minutes)) {
      alert("Invalid time format");
      return;
    }

    updatedTime.setHours(hours, minutes);

    await updateDoc(doc(db, "appointments", selectedEvent.id), {
      status: "Approved",
      confirmedTime: updatedTime,
      doctor: selectedDoctor,
      note: newNote || selectedEvent.note,
    });

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              status: "Approved",
              confirmedTime: updatedTime,
              doctor: selectedDoctor,
              note: newNote || selectedEvent.note,
            }
          : event
      )
    );

    setDialogOpen(false);
  };

  const handleDisapprove = async () => {
    await updateDoc(doc(db, "appointments", selectedEvent.id), {
      status: "Disapproved",
      doctor: null,
      confirmedTime: null,
      note: newNote || selectedEvent.note,
    });

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              status: "Disapproved",
              confirmedTime: null,
              doctor: null,
              note: newNote || selectedEvent.note,
            }
          : event
      )
    );

    setDialogOpen(false);
  };

  const handleDeleteNote = async () => {
    console.log("Selected Event to Delete:", selectedEvent); // Log the selected event
    if (selectedEvent?.id) {
      try {
        // Delete the note from Firestore
        await deleteDoc(doc(db, "notes", selectedEvent.id));
        console.log("Note deleted successfully.");
  
        // Remove the note from the events state and log the updated events
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents.filter((event) => event.id !== selectedEvent.id);
          console.log("Updated events after deletion:", updatedEvents); // Log the updated events
          return updatedEvents;
        });
  
        // Close the dialog
        setDialogOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error deleting note:", error); // Log any errors that occur
      }
    } else {
      console.log("No note ID found for deletion."); // Log if no ID is available
    }
  };  
  console.log("selectedEvent:", selectedEvent);

  return (
    <Box sx={{ height: "80vh" }}>
      <DragAndDropCalendar
        ref={calendarRef}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        resizable
        draggableAccessor={() => true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventClick}
        defaultView={Views.MONTH}
        view={currentView}
        onView={setCurrentView}
        views={["month", "week", "day"]}
        date={currentDate}
        onNavigate={setCurrentDate}
        style={{
          height: "100%",
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "12px",
        }}
        eventPropGetter={(event) => {
          let backgroundColor = "";
          let textColor = "black";
  
          if (event.status === "Pending") backgroundColor = "#FFEB3B";
          else if (event.status === "Done") backgroundColor = "#4a90e2";
          else if (event.status === "Vaccine") backgroundColor = "#f8c8d1";
          else if (event.status === "Approved") backgroundColor = "#4CAF50";
          else if (event.status === "Disapproved") {
            backgroundColor = "#f44336";
            textColor = "#fff";
          } else if (event.status === "Note") {
            backgroundColor = "#90CAF9"; // Light blue
          }
  
          return {
            style: {
              backgroundColor,
              color: textColor,
              borderRadius: "8px",
              padding: "2px 6px",
              border: "1px solid #ccc",
            },
            title: event.status === "Note" ? event.note : undefined, // show note on hover
          };
        }}
      />
  
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>
                  {
                    selectedEvent?.status === "Note" || !selectedEvent
                      ? "Note"
                      : selectedEvent?.status === "Vaccine"
                      ? "Manage Vaccine"
                      : "Manage Appointment"
                  }
                </DialogTitle>
                <DialogContent>
                
                {selectedEvent?.status === "Disapproved" && (
            <>
              {/* Appointment Fields */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                Student ID: {selectedEvent.studentId}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Reason: {selectedEvent.note}
              </Typography>

              {/* Doctor Type Select */}
              <FormControl fullWidth margin="dense">
                <InputLabel>Type of Doctor</InputLabel>
                <Select
                  value={selectedDoctorType}
                  onChange={(e) => {
                    setSelectedDoctorType(e.target.value);
                    setSelectedDoctor("");
                  }}
                  disabled={!isEditing} // Disabled when not in editing mode
                >
                  {[...new Set(filteredDoctors.map((doc) => doc.type))].map((type, index) => (
                    <MenuItem key={index} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Doctor Select */}
              <FormControl
                fullWidth
                margin="dense"
                disabled={!selectedDoctorType || !isEditing} // Disable when no doctor type is selected or not in editing mode
              >
                <InputLabel>Doctor's Name</InputLabel>
                <Select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  {filteredDoctors
                    .filter((doc) => doc.type === selectedDoctorType)
                    .map((doctor, index) => (
                      <MenuItem key={index} value={doctor.name}>
                        {doctor.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Time Select */}
              <FormControl
                fullWidth
                margin="dense"
                disabled={!selectedDoctor || !isEditing} // Disable when no doctor is selected or not in editing mode
              >
                <InputLabel>Time Slot</InputLabel>
                <Select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  {availableTimes.length === 0 ? (
                    <MenuItem disabled>No available times</MenuItem>
                  ) : (
                    availableTimes.map((time, index) => {
                      const [hourStr, minuteStr] = time.split(":");
                      const date = new Date();
                      date.setHours(Number(hourStr), Number(minuteStr));
                      const formattedTime = date.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return (
                        <MenuItem key={index} value={time}>
                          {formattedTime}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>

              {/* Edit and Submit Buttons */}
              {isEditing ? (
                <>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      // Logic to submit the edited event as approved again
                      try {
                        // You can perform updates to the selectedEvent (e.g., set status to "Approved")
                        await updateDoc(doc(firestore, "appointments", selectedEvent.id), {
                          status: "Approved", // Submit as approved after editing
                          doctor: selectedDoctor,
                          time: selectedTime,
                        });
                        setDialogOpen(false); // Close the dialog after submission
                      } catch (error) {
                        console.error("Error submitting the edited appointment:", error);
                      }
                    }}
                  >
                    Submit Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>Cancel Edit</Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setIsEditing(true)}>
                  Edit Appointment
                </Button>
              )}
            </>
          )}

      {(!selectedEvent?.status || selectedEvent.status === "Note") && (
        <>
          <TextField
            label={selectedEvent?.id ? "Edit Note" : "Add Note"}
            fullWidth
            margin="dense"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          {!selectedEvent && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              No events scheduled for this day. You can add a note.
            </Typography>
          )}
        </>
      )}
        {selectedEvent?.status === "Vaccine" && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedUserForVaccine}
                onChange={(e) => setSelectedUserForVaccine(e.target.value)}
              >
                {filteredUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.email || user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Select a student to schedule a vaccine appointment.
            </Typography>
          </>
        )}

        {(selectedEvent?.status === "Pending" || selectedEvent?.status === "Approved") && (
          <>
            {/* Appointment Fields */}
            <Typography variant="body2" sx={{ mb: 1 }}>
              Student ID: {selectedEvent.studentId}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Reason: {selectedEvent.note}
            </Typography>

            {/* Doctor Type Select */}
            <FormControl fullWidth margin="dense">
              <InputLabel>Type of Doctor</InputLabel>
              <Select
                value={selectedDoctorType}
                onChange={(e) => {
                  setSelectedDoctorType(e.target.value);
                  setSelectedDoctor("");
                }}
                disabled={!isEditing && selectedEvent?.status === "Approved"}
              >
                {[...new Set(filteredDoctors.map((doc) => doc.type))].map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Doctor Select */}
            <FormControl
              fullWidth
              margin="dense"
              disabled={!selectedDoctorType || (!isEditing && selectedEvent?.status === "Approved")}
            >
              <InputLabel>Doctor's Name</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                {filteredDoctors
                  .filter((doc) => doc.type === selectedDoctorType)
                  .map((doctor, index) => (
                    <MenuItem key={index} value={doctor.name}>
                      {doctor.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Time Select */}
            <FormControl
              fullWidth
              margin="dense"
              disabled={!selectedDoctor || (!isEditing && selectedEvent?.status === "Approved")}
            >
              <InputLabel>Time Slot</InputLabel>
              <Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                {availableTimes.length === 0 ? (
                  <MenuItem disabled>No available times</MenuItem>
                ) : (
                  availableTimes.map((time, index) => {
                    const [hourStr, minuteStr] = time.split(":");
                    const date = new Date();
                    date.setHours(Number(hourStr), Number(minuteStr));
                    const formattedTime = date.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                    return (
                      <MenuItem key={index} value={time}>
                        {formattedTime}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {/* Vaccine Only */}
        {selectedEvent?.status === "Vaccine" && (
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedUserForVaccine) return;
              const newAppointment = {
                studentId: selectedUserForVaccine,
                start: selectedEvent.start,
                end: selectedEvent.end,
                status: "Vaccine",
                note: "Scheduled vaccination",
                createdAt: new Date(),
              };
              try {
                await addDoc(collection(firestore, "appointments"), newAppointment);
                setDialogOpen(false);
                setSelectedUserForVaccine("");
              } catch (error) {
                console.error("Error scheduling vaccine:", error);
              }
            }}
          >
            Submit Vaccine Appointment
          </Button>
        )} 
        {/* Add Note Only */}
        {!selectedEvent?.status && (
          <>
            <Button variant="contained" onClick={handleSaveNote}>
              Save Note
            </Button>
          </>
        )}
        {/* Note Only */}
        {selectedEvent?.status === "Note" && (
          <>
            <Button onClick={handleDeleteNote} color="error">
              Delete Note
            </Button>
            <Button variant="contained" onClick={handleSaveNote}>
              Save Note
            </Button>
          </>
        )}

        {/* Appointment Buttons */}
        {selectedEvent?.status === "Pending" && (
          <>
            <Button onClick={handleDisapprove} color="error">
              Disapprove
            </Button>
            <Button variant="contained" onClick={handleSubmitApproval}>
              Approve & Submit
            </Button>
          </>
        )}

        {selectedEvent?.status === "Approved" && !isEditing && (
          <>
            <Button onClick={handleDisapprove} color="error">
              Disapprove
            </Button>
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </>
        )}

        {selectedEvent?.status === "Approved" && isEditing && (
          <>
            <Button onClick={handleSubmitApproval} variant="contained">
              Save Changes
            </Button>
            <Button onClick={() => setIsEditing(false)}>Cancel Edit</Button>
          </>
        )}

        <Button onClick={() => setDialogOpen(false)}>Close</Button>
      </DialogActions>
      </Dialog>
    </Box>
  );
  
};

export default CalendarView;
