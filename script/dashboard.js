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
          backCamera.id,
          { fps: 10, qrbox: 250 },
          decodedText => {
            document.getElementById("result").innerText = `Scanned: ${decodedText}`;

            db.collection("patrol_logs").add({
              userId: user.uid,
              qrData: decodedText,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            qrScanner.stop();
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

    db.collection("patrol_logs").where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
        const logTable = document.getElementById("log-table");
        logTable.innerHTML = "";
        snapshot.forEach(doc => {
          const data = doc.data();
          const row = `<tr>
            <td class="border px-2 py-1">${data.timestamp?.toDate().toLocaleString() || "-"}</td>
            <td class="border px-2 py-1">${data.qrData}</td>
          </tr>`;
          logTable.innerHTML += row;
        });
      });
  }
});

function exportCSV() {
  const rows = [["Waktu", "QR"]];

  db.collection("patrol_logs").get().then(snapshot => {
    snapshot.forEach(doc => {
      const d = doc.data();
      rows.push([
        d.timestamp?.toDate().toLocaleString() || "",
        d.qrData
      ]);
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
