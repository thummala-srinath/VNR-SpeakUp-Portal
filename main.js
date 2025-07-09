import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Form Elements
const form = document.getElementById("suggestionForm");
const statusBox = document.getElementById("submissionStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "⏳ Uploading...";
  statusBox.className = "text-yellow-600";

  const text = form.querySelector("textarea").value.trim();
  const category = form.querySelector("select").value;
  const file = document.getElementById("fileInput").files[0];

  if (!text || !category) {
    statusBox.textContent = "❌ Fill all fields";
    statusBox.className = "text-red-600";
    return;
  }

  let fileURL = null;

  try {
    // Upload file if provided
    if (file) {
      const fileRef = ref(storage, `evidence/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
      console.log("📁 File uploaded successfully:", fileURL);
    }

    // Submit to Firestore
    const docRef = await addDoc(collection(db, "suggestions"), {
      text, category, status: "Pending", fileURL, timestamp: serverTimestamp()
    });

    console.log("🗃️ Suggestion saved with ID:", docRef.id);
    statusBox.textContent = "✅ Suggestion submitted!";
    statusBox.className = "text-green-600";
    form.reset();
  } catch (err) {
    console.error("❌ Submission Error:", err);
    statusBox.textContent = "🚨 Submission failed. Check console for details.";
    statusBox.className = "text-red-600";
  }

  setTimeout(() => (statusBox.textContent = ""), 5000);
});

// Admin login redirect
const adminForm = document.getElementById("adminForm");
adminForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = adminForm.querySelector('input[type="email"]').value;
  const password = adminForm.querySelector('input[type="password"]').value;

  if (email === "admin@vnrvjiet.ac.in" && password === "#VNRVJIET@2k25") {
    console.log("🔐 Admin authenticated.");
    window.location.href = "admin.html";
  } else {
    alert("❌ Invalid credentials");
  }
});
