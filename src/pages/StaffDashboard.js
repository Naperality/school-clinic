import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const navigate = useNavigate(); // ✅ must be inside the component

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login");
    });
  };

  return (
    <div>
      <h2>Staff Dashboard</h2>
      <p>Welcome, staff! Your calendar, notes, and tools will go here.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default StaffDashboard;
