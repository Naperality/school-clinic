import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./Login.module.css";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // For handling loading state
  const [redirectTo, setRedirectTo] = useState(null); // Track redirect target based on role
  const navigate = useNavigate();

  // Check if the user is already logged in and redirect if needed
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is already logged in, handle redirection
        checkUserRole(user);
      }
    });

    return () => unsubscribe(); // Cleanup listener when the component unmounts
  }, []);

  // Function to handle redirection based on the user's role
  const checkUserRole = async (user) => {
    // Step 1: Check if the user is a doctor
    const doctorsQuery = query(collection(db, "doctors"), where("email", "==", user.email));
    const querySnapshot = await getDocs(doctorsQuery);

    if (!querySnapshot.empty) {
      // Doctor found, set redirect to doctor dashboard
      setRedirectTo("/doctor-dashboard");
    } else {
      // If it's not a doctor, check for staff or student
      const userDocRef = doc(db, "users", user.uid);
      const regularUserDoc = await getDoc(userDocRef);
      if (regularUserDoc.exists()) {
        const role = regularUserDoc.data().role;
        if (role === "staff") {
          setRedirectTo("/staff"); // Staff dashboard
        } else if (role === "student") {
          setRedirectTo("/student"); // Student dashboard
        } else {
          alert("Unknown role, please check your account.");
        }
      } else {
        alert("No user data found.");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      checkUserRole(user); // Redirect user based on their role after login
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false); // Hide loading spinner after login attempt
    }
  };

  // If user is already logged in, prevent them from accessing the login page
  const currentUser = auth.currentUser;
  if (currentUser) {
    // If the redirect target is set after user login, navigate accordingly
    return redirectTo ? <Navigate to={redirectTo} /> : null;
  }

  return (
    <AuthFormWrapper>
      <motion.div
        className={styles.backBtnContainer}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => navigate("/")}
      >
        <FaArrowLeft size={20} />
        <span></span>
      </motion.div>

      <motion.h2
        className={styles.loginTitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome Back
      </motion.h2>

      <motion.p
        className={styles.loginSubtext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Access your clinic dashboard with ease.
      </motion.p>

      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          type="email"
          placeholder="Email"
          className={styles.loginInput}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.loginInput}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.loginBtn} disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </button>
      </form>
    </AuthFormWrapper>
  );
};

export default Login;
