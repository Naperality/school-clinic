// src/components/AuthFormWrapper.js
import React from "react";
import { motion } from "framer-motion";
import "./AuthFormWrapper.css";

const AuthFormWrapper = ({ children }) => {
  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100vw", opacity: 0 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthFormWrapper;
