import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { motion } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User Created:", user);

      // Set default profile picture URL or leave it blank
      const profilePictureUrl = "https://www.example.com/default-avatar.png"; // Placeholder image URL

      const userData = {
        email,
        role,
        name,
        age,
        birthDate,
        profilePictureUrl, // Using the default avatar URL
      };
      console.log("Data to save:", userData);  // Check the data you're saving

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Data successfully saved to Firestore!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Error during signup:", error);
      alert(error.message);
    }
  };

  return (
    <AuthFormWrapper>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-form"
      >
        <h2 className="form-title">Sign Up</h2>
        <form onSubmit={handleSignup} className="form-content">
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow whole numbers between 1 and 120
              if (/^\d{0,3}$/.test(val) && +val >= 0 && +val <= 120) {
                setAge(val);
              }
            }}
            required
            className="form-input"
          />
          <input
            type="date"
            placeholder="Birth Date"
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
          <select
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className="form-select"
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
          <button type="submit" className="form-button">
            Sign Up
          </button>
        </form>
      </motion.div>
    </AuthFormWrapper>
  );
};

export default Signup;
