function logout() {
  auth.signOut().then(() => window.location.href = 'login.html');
}

let qrScanner;
let torchOn = false;

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const qrRegion = document.getElementById("qr-reader");
    const flashBtn = document.getElementById("toggle-flash");

    qrScanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        const backCamera = devices.find(d => /back|rear/i.test(d.label)) || devices[0];

        qrScanner.start(
  userId: user.uid,
  qrData: decodedText,
  namaTitik: namaTitik,
  lokasi: { lat, lng },
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
  alert(`Berhasil menyimpan log untuk titik: ${namaTitik}`);
  qrScanner.stop(); // stop setelah berhasil menyimpan
}).catch(error => {
  alert("Gagal menyimpan log patroli: " + error.message);
});
          backCamera.id,
          { fps: 10, qrbox: 250 },
          async decodedText => {
            document.getElementById("result").innerText = `Scanned: ${decodedText}`;

            // Ambil lokasi GPS
            navigator.geolocation.getCurrentPosition(async position => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              // Ambil nama titik dari koleksi locations
              let namaTitik = "Tidak diketahui";
              const lokasiDoc = await db.collection("locations").doc(decodedText).get();
              if (lokasiDoc.exists) {
                namaTitik = lokasiDoc.data().namaTitik;
              }

              // Simpan log ke Firestore
              await db.collection("patrol_logs").add({
                userId: user.uid,
                qrData: decodedText,
                namaTitik: namaTitik,
                lokasi: { lat, lng },
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
              });

              qrScanner.stop();
            }, error => {
              alert("Gagal mendapatkan lokasi GPS");
            });
          },
          error => {}
        ).then(() => {
          flashBtn.classList.remove("hidden");
          flashBtn.onclick = () => {
            torchOn = !torchOn;
            qrScanner.applyVideoConstraints({ advanced: [{ torch: torchOn }] });
          };
        });
      }
    });

    // Menampilkan histori scan user
    db.collection("patrol_logs")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
        const logTable = document.getElementById("log-table");
        logTable.innerHTML = "";
        snapshot.forEach(doc => {
          const data = doc.data();
          const time = data.timestamp?.toDate().toLocaleString() || "-";
          const qr = data.qrData || "-";
          const titik = data.namaTitik || "-";
          const lokasi = data.lokasi ? `(${data.lokasi.lat.toFixed(5)}, ${data.lokasi.lng.toFixed(5)})` : "-";
          const row = `<tr>
            <td class="border px-2 py-1">${time}</td>
            <td class="border px-2 py-1">${qr}</td>
            <td class="border px-2 py-1">${titik}</td>
            <td class="border px-2 py-1">${lokasi}</td>
          </tr>`;
          logTable.innerHTML += row;
        });
      });
  }
});

function exportCSV() {
  const rows = [["Waktu", "QR", "Titik", "Latitude", "Longitude"]];
  db.collection("patrol_logs").get().then(snapshot => {
    snapshot.forEach(doc => {
      const d = doc.data();
      const waktu = d.timestamp?.toDate().toLocaleString() || "";
      const lat = d.lokasi?.lat || "";
      const lng = d.lokasi?.lng || "";
      rows.push([waktu, d.qrData, d.namaTitik, lat, lng]);
    });

    const csv = rows.map(r => r.join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "log_patrol.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}
