const firebaseConfig = {
  // Ganti dengan konfigurasi Firebase milikmu
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let qrScanner;
const videoElem = document.getElementById("qr-video");

// Autentikasi: cek user login
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    loadLogs();
    startScanner();
  }
});

// Fungsi untuk memulai ulang QR scanner
function startScanner() {
  qrScanner = new QrScanner(videoElem, async (decodedText) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      qrScanner.stop(); // hentikan scanner sementara

      // Cek QR di Firestore
      const locationDoc = await db.collection("locations").doc(decodedText).get();
      if (!locationDoc.exists) {
        alert("❌ QR tidak terdaftar!");
        return;
      }
      const namaTitik = locationDoc.data().nama;

      // Ambil lokasi GPS
      let lat = null, lng = null;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition((pos) => {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            resolve();
          }, resolve);
        });
      }

      // Simpan log ke Firestore
      await db.collection("patrol_logs").add({
        userId: user.uid,
        qrData: decodedText,
        namaTitik: namaTitik,
        lokasi: { lat, lng },
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert(`✅ Log berhasil disimpan untuk titik: ${namaTitik}`);

      // Tampilkan tombol scan ulang
      document.getElementById("rescan-btn").style.display = "block";

    } catch (error) {
      alert("❌ Gagal menyimpan log: " + error.message);
      console.error(error);
      qrScanner.start();
    }
  });

  qrScanner.start();
  document.getElementById("rescan-btn").style.display = "none";
}

// Fungsi logout
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

// Tampilkan log patroli
function loadLogs() {
  const logList = document.getElementById("log-list");
  const user = auth.currentUser;

  db.collection("patrol_logs")
    .where("userId", "==", user.uid)
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      logList.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp?.toDate().toLocaleString() || "-";
        const li = document.createElement("li");
        li.textContent = `${data.namaTitik} (${data.qrData}) - ${date}`;
        logList.appendChild(li);
      });
    });
}
