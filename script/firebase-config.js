// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Ganti konfigurasi ini sesuai dengan Firebase Project Anda
const firebaseConfig = {
  apiKey: "AIzaSyArIi3LoUzzKEMzuex4WJr-iIhYxQWCi-k",
  authDomain: "qrpatrol-8bffa.firebaseapp.com",
  projectId: "qrpatrol-8bffa",
  storageBucket: "qrpatrol-8bffa.appspot.com",
  messagingSenderId: "754593461619",
  appId: "1:754593461619:web:5b61abddcdaa310203c106",
  measurementId: "G-G39HTJZVZC"
};


// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor modul yang dibutuhkan
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
