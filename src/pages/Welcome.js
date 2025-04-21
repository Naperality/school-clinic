// src/pages/Welcome.js
import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaClinicMedical } from "react-icons/fa";
import styles from "./Welcome.module.css";

const Welcome = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (currentUser) {
    return userRole === "staff" ? <Navigate to="/staff" /> : <Navigate to="/student" />;
  }

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.floatingShapes} />

      <motion.div
        className={styles.welcomeContent}
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          initial={{ rotate: -20, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className={styles.welcomeIcon}
        >
          <FaClinicMedical />
        </motion.div>

        <h1 className={styles.welcomeTitle}>
          Welcome to Your <span className={styles.noWrap}>Health Space</span>
        </h1>
        <p className={styles.welcomeSubtext}>
          Empowering student wellness — one appointment at a time.
        </p>

        <div className={styles.welcomeButtons}>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.welcomeBtn}
            >
              Log In
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.welcomeBtn}
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
