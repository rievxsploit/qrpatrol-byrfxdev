auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    const qrScanner = new Html5Qrcode("qr-reader");

    function onScanSuccess(decodedText) {
      document.getElementById("result").innerText = `Scanned: ${decodedText}`;
      db.collection("patrol_logs").add({
        userId: user.uid,
        qrData: decodedText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        alert("Scan saved!");
      }).catch(err => {
        alert("Error saving: " + err);
      });
      qrScanner.stop();
    }

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        qrScanner.start(devices[0].id, { fps: 10, qrbox: 250 }, onScanSuccess);
      }
    });
  }
});