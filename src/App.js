import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LoginRedirect from "./pages/LoginRedirect";
import SignupRedirect from "./pages/SignupRedirect";
import Welcome from "./pages/Welcome";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";


const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={<SignupRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/staff"
          element={
            <PrivateRoute role="staff">
              <StaffDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student"
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        {/* <Route
          path="/book"
          element={
            <PrivateRoute role="student">
              <BookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <PrivateRoute role="student">
              <MyAppointments />
            </PrivateRoute>
          }
        /> */}
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
