import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Ensure everything waits for DOM to load
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("suggestionForm");
  const statusBox = document.getElementById("submissionStatus");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "⏳ Uploading...";
    statusBox.className = "text-yellow-600";

    const text = form.querySelector("textarea").value.trim();
    const category = form.querySelector("select").value;
    const file = document.getElementById("fileInput").files[0];

    // ✅ Basic field validation
    if (!text || !category) {
      statusBox.textContent = "❌ Fill all fields";
      statusBox.className = "text-red-600";
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      statusBox.textContent = "❌ File too large (max 10MB)";
      statusBox.className = "text-red-600";
      return;
    }

    let fileURL = null;

    try {
      // ✅ File upload block
      if (file) {
        const fileRef = ref(storage, `evidence/${Date.now()}_${file.name}`);
        console.log("📦 Uploading file:", file.name);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
        console.log("✅ File uploaded. URL:", fileURL);
      }

      // ✅ Debug log before submission
      const submissionData = {
        text,
        category,
        status: "Pending",
        fileURL: fileURL || null,
        timestamp: serverTimestamp()
      };

      console.log("🚀 Submitting to Firestore:", submissionData);

      await addDoc(collection(db, "suggestions"), submissionData);

      statusBox.textContent = "✅ Suggestion submitted!";
      statusBox.className = "text-green-600";
      form.reset();
    } catch (err) {
      console.error("❌ Firestore submission failed:", err);
      statusBox.textContent = "🚨 Submission failed. Try again.";
      statusBox.className = "text-red-600";
    }

    setTimeout(() => (statusBox.textContent = ""), 5000);
  });

  // ✅ Admin Login block
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
});
