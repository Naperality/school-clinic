// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === "staff") {
            navigate("/staff");
          } else if (role === "student") {
            navigate("/student");
          } else {
            alert("Unknown role");
          }
        } else {
          alert("User data not found");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [navigate]);

  return loading ? <p>Loading...</p> : null;
};

export default Dashboard;
