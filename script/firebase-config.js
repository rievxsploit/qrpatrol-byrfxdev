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
firebase.initializeApp(firebaseConfig);

// Inisialisasi Auth dan Firestore
const auth = firebase.auth();
const db = firebase.firestore();
