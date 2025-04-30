// Ganti dengan konfigurasi Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyArIi3LoUzzKEMzuex4WJr-iIhYxQWCi-k",
  authDomain: "qrpatrol-8bffa.firebaseapp.com",
  projectId: "qrpatrol-8bffa",
  storageBucket: "qrpatrol-8bffa.firebasestorage.app",
  messagingSenderId: "754593461619",
  appId: "1:754593461619:web:5b61abddcdaa310203c106",
  measurementId: "G-G39HTJZVZC"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
