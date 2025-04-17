// src/pages/Welcome.js
import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./Welcome.css";

const Welcome = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (currentUser) {
    return userRole === "staff" ? <Navigate to="/staff" /> : <Navigate to="/student" />;
  }

  return (
    <div className="welcome-container">
      <motion.div
        className="welcome-content"
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1>Welcome to the School Clinic Management System</h1>
        <p>Please choose an option to continue:</p>
        <div className="welcome-buttons">
          <Link to="/login">
            <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="welcome-btn"
            >
            Log In
          </motion.button>
          </Link>
          <Link to="/signup">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="welcome-btn"
          >
            Sign Up
          </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
