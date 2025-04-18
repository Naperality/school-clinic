// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
