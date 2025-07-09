import { db, storage } from './firebase-config.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Suggestion Form Submission
const form = document.getElementById("suggestionForm");
const statusBox = document.getElementById("submissionStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "⏳ Uploading...";
  statusBox.className = "mt-4 text-sm text-yellow-600";

  const text = form.querySelector("textarea").value.trim();
  const category = form.querySelector("select").value;
  const file = document.getElementById("fileInput").files[0];

  if (!text || !category) {
    statusBox.textContent = "❌ Please fill all fields.";
    statusBox.className = "mt-4 text-sm text-red-600";
    return;
  }

  let fileURL = null;

  try {
    if (file) {
      const fileRef = ref(storage, `evidence/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, "suggestions"), {
      text,
      category,
      status: "Pending",
      timestamp: serverTimestamp(),
      fileURL
    });

    statusBox.textContent = "✅ Suggestion successfully submitted!";
    statusBox.className = "mt-4 text-sm text-green-600";
    form.reset();
  } catch (err) {
    console.error("Error submitting suggestion:", err);
    statusBox.textContent = "❌ Submission failed. Please try again.";
    statusBox.className = "mt-4 text-sm text-red-600";
  }

  setTimeout(() => {
    statusBox.textContent = "";
  }, 5000);
});

// Admin Login (Hardcoded)
const adminForm = document.getElementById("adminForm");
adminForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = adminForm.querySelector('input[type="email"]').value;
  const password = adminForm.querySelector('input[type="password"]').value;

  if (email === "admin@vnrvjiet.ac.in" && password === "#VNRVJIET@2k25") {
    window.location.href = "admin.html";
  } else {
    alert("❌ Invalid credentials");
  }
});
