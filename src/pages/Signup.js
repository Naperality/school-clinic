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
  const [birthYear, setBirthYear] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
        name,
        age,
        birthYear,
        profilePictureUrl,
      });

      navigate("/dashboard");
    } catch (error) {
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
            onChange={(e) => setAge(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Birth Year"
            onChange={(e) => setBirthYear(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="url"
            placeholder="Profile Picture URL"
            onChange={(e) => setProfilePictureUrl(e.target.value)}
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
