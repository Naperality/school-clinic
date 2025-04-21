import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc,  query, collection, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Step 1: Check if doctor with that email exists
      const doctorsQuery = query(collection(db, "doctors"), where("email", "==", email));
      const querySnapshot = await getDocs(doctorsQuery);
  
      if (!querySnapshot.empty) {
        // Doctor found
        navigate("/doctor-dashboard");
      } else {
        // Check if staff or student
        const userDocRef = doc(db, "users", user.uid);
        const regularUserDoc = await getDoc(userDocRef);
        if (regularUserDoc.exists()) {
          const role = regularUserDoc.data().role;
          navigate(role === "staff" ? "/staff" : "/student");
        } else {
          alert("No user data found.");
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };  

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
        <button type="submit" className={styles.loginBtn}>
          Log In
        </button>
      </form>
    </AuthFormWrapper>
  );
};

export default Login;
