import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./Signup.module.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const role = "Student";
      const profilePictureUrl = "https://www.example.com/default-avatar.png";

      const userData = {
        email,
        role,
        name,
        age,
        birthDate,
        profilePictureUrl,
      };

      await setDoc(doc(db, "users", user.uid), userData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during signup:", error);
      alert(error.message);
    }
  };

  return (
    <AuthFormWrapper>
      <div className={styles.backBtnContainer} onClick={() => navigate(-1)}>
        <FaArrowLeft size={24} color="#1abc9c" />
      </div>

      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.authForm}
      >
        <h2 className={styles.formTitle}>Sign Up</h2>
        <form onSubmit={handleSignup} className={styles.formContent}>
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.formInput}
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{0,3}$/.test(val) && +val >= 0 && +val <= 120) {
                setAge(val);
              }
            }}
            required
            className={styles.formInput}
          />
          <input
            type="date"
            placeholder="Birth Date"
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className={styles.formInput}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.formInput}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.formInput}
          />

          <button type="submit" className={styles.formButton}>
            Sign Up
          </button>
        </form>
      </motion.div>
    </AuthFormWrapper>
  );
};

export default Signup;
