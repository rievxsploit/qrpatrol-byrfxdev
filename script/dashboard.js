import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Konfigurasi Firebase (pindahkan dari firebase-config.js jika belum)
const firebaseConfig = {
  apiKey: "AIzaSyArIi3LoUzzKEMzuex4WJr-iIhYxQWCi-k",
  authDomain: "qrpatrol-8bffa.firebaseapp.com",
  projectId: "qrpatrol-8bffa",
  storageBucket: "qrpatrol-8bffa.appspot.com",
  messagingSenderId: "754593461619",
  appId: "1:754593461619:web:5b61abddcdaa310203c106",
  measurementId: "G-G39HTJZVZC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let scanner;
let currentUser;
let videoElem = document.getElementById("qr-video");

const rescanBtn = document.getElementById("rescan-btn");
const flashBtn = document.getElementById("toggle-flash");
const switchCamBtn = document.getElementById("switch-camera");

// Periksa login
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
    initScanner();
    loadHistory();
  }
});

// Inisialisasi scanner
async function initScanner() {
  const QrScanner = window.QrScanner;
  const devices = await QrScanner.listCameras(true);
  let currentCam = 0;

  scanner = new QrScanner(videoElem, async (result) => {
    if (result?.data) {
      scanner.stop();
      rescanBtn.classList.remove("hidden");
      await handleScan(result.data);
    }
  }, {
    returnDetailedScanResult: true
  });

  if (devices.length > 0) {
    await scanner.setCamera(devices[0].id);
    flashBtn.classList.remove("hidden");
    switchCamBtn.classList.remove("hidden");
  }

  scanner.start();

  // Tombol Ganti Kamera
  switchCamBtn.onclick = async () => {
    currentCam = (currentCam + 1) % devices.length;
    await scanner.setCamera(devices[currentCam].id);
  };

  // Tombol Flash
  flashBtn.onclick = async () => {
    const flashOn = await scanner.toggleFlash();
    flashBtn.textContent = flashOn ? "🔦 Flash ON" : "🔦 Flash OFF";
  };

  rescanBtn.onclick = () => {
    scanner.start();
    rescanBtn.classList.add("hidden");
  };
}

// Proses hasil scan
async function handleScan(qrText) {
  const kodeQR = qrText.trim();
  const lokasiRef = collection(db, "location");
  const q = query(lokasiRef, where("kode", "==", kodeQR));
  const lokasiSnap = await getDocs(q);

  let namaTitik = "Tidak dikenal";

  lokasiSnap.forEach((doc) => {
    namaTitik = doc.data().nama;
  });

  const userEmail = currentUser.email;

  // Simpan log
  await addDoc(collection(db, "logPatroli"), {
    email: userEmail,
    kode: kodeQR,
    namaTitik,
    waktu: new Date()
  });

  alert(`Scan berhasil di titik: ${namaTitik}`);
  loadHistory();
}

// Ambil histori user
async function loadHistory() {
  const logList = document.getElementById("log-list");
  logList.innerHTML = "Memuat...";

  const q = query(
    collection(db, "logPatroli"),
    where("email", "==", currentUser.email),
    orderBy("waktu", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    logList.innerHTML = "<li>Belum ada log.</li>";
    return;
  }

  let items = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const waktu = new Date(data.waktu?.seconds * 1000).toLocaleString("id-ID");
    items.push(`<li><strong>${data.namaTitik}</strong> (${data.kode})<br><small>${waktu}</small></li>`);
  });

  logList.innerHTML = items.join("");
}

// Ekspor data
document.getElementById("export-btn").onclick = async () => {
  const q = query(
    collection(db, "logPatroli"),
    where("email", "==", currentUser.email),
    orderBy("waktu", "desc")
  );
  const snapshot = await getDocs(q);
  let csv = "Kode QR,Nama Titik,Waktu\n";

  snapshot.forEach(doc => {
    const data = doc.data();
    const waktu = new Date(data.waktu?.seconds * 1000).toLocaleString("id-ID");
    csv += `${data.kode},"${data.namaTitik}",${waktu}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "log_patroli.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Logout
document.getElementById("logout-btn").onclick = () => {
  signOut(auth);
};
