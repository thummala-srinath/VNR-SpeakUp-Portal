import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("suggestionForm");
  const statusBox = document.getElementById("submissionStatus");

  // ✅ Suggestion Submission
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "⏳ Uploading...";
    statusBox.className = "text-yellow-600";

    const text = form.querySelector("textarea").value.trim();
    const type = form.querySelector("#type").value;
    const category = form.querySelector("#category").value;
    const file = document.getElementById("fileInput").files[0];

    if (!text || !type || !category) {
      statusBox.textContent = "❌ Please fill all fields.";
      statusBox.className = "text-red-600";
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
        type,
        category,
        status: "Pending",
        fileURL,
        timestamp: serverTimestamp()
      });

      statusBox.textContent = "✅ Submission successful!";
      statusBox.className = "text-green-600";
      form.reset();
      loadSuggestions();
    } catch (err) {
      statusBox.textContent = "🚨 Submission failed. Try again.";
      statusBox.className = "text-red-600";
      console.error(err);
    }

    setTimeout(() => (statusBox.textContent = ""), 5000);
  });

  // ✅ Admin Login Handler
  const adminForm = document.getElementById("adminForm");

  adminForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = adminForm.querySelector('input[type="email"]').value;
    const password = adminForm.querySelector('input[type="password"]').value;

    // You can replace this with Firebase Auth later
    if (email === "admin@vnrvjiet.ac.in" && password === "#VNRVJIET@2k25") {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "adminDashboard.html";
    } else {
      alert("❌ Invalid credentials");
    }
  });

  // ✅ Load Recent Suggestions (on homepage)
  loadSuggestions();
});

// ✅ Function to load last 5 suggestions
async function loadSuggestions() {
  const list = document.getElementById("suggestionList");
  if (!list) return;

  const q = query(collection(db, "suggestions"), orderBy("timestamp", "desc"), limit(5));
  const snapshot = await getDocs(q);

  list.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const el = document.createElement("div");
    el.className = "p-3 border rounded shadow-sm bg-gray-50";

    el.innerHTML = `
      <div class="border-b pb-2 mb-2">
        <p class="text-gray-800 mb-1"><strong>${data.type || 'N/A'} | ${data.category || ''}</strong></p>
        <p>${data.text}</p>
        ${data.fileURL ? `<a href="${data.fileURL}" target="_blank" class="text-blue-600 underline">📎 View Attachment</a>` : ""}
      </div>
    `;
    list.appendChild(el);
  });
}
