// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQF4sJ-ywMTOhZlearQ4vckyyqdt7xaps",
    authDomain: "schoolclinicsystem.firebaseapp.com",
    projectId: "schoolclinicsystem",
    storageBucket: "schoolclinicsystem.firebasestorage.app",
    messagingSenderId: "682114436163",
    appId: "1:682114436163:web:69c8a318d6dc5a418f18f6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
