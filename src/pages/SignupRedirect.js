import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Signup from "./Signup";
import { AnimatePresence } from "framer-motion";

const SignupRedirect = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (currentUser) {
    return userRole === "staff" ? <Navigate to="/staff" /> : <Navigate to="/student" />;
  }

  return(
    <AnimatePresence mode="wait">
      <Signup />
    </AnimatePresence>);
};

export default SignupRedirect;
