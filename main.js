import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

window.addEventListener('DOMContentLoaded', () => {
  // Suggestion Submission
  const form = document.getElementById("suggestionForm");
  const statusBox = document.getElementById("submissionStatus");

  form?.addEventListener("submit", async (e) => {
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
      if (file) {
        const fileRef = ref(storage, `evidence/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "suggestions"), {
        text,
        category,
        status: "Pending",
        fileURL,
        timestamp: serverTimestamp()
      });

      statusBox.textContent = "✅ Suggestion submitted!";
      statusBox.className = "text-green-600";
      form.reset();
      loadSuggestions(); // Refresh suggestions after submission
    } catch (err) {
      statusBox.textContent = "🚨 Submission failed. Try again.";
      statusBox.className = "text-red-600";
      console.error(err);
    }

    setTimeout(() => (statusBox.textContent = ""), 5000);
  });

  // Admin Login
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

  // Load Suggestions to Home
  loadSuggestions();
});

// Utility to get badge style
function getStatusColor(status) {
  switch (status) {
    case "Resolved": return "bg-green-100 text-green-700";
    case "In Progress": return "bg-yellow-100 text-yellow-700";
    case "Pending":
    default: return "bg-red-100 text-red-700";
  }
}

// Fetch and render recent suggestions
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
      <div class="flex justify-between items-center">
        <p class="text-gray-800">${data.text}</p>
        <span class="text-xs font-medium px-2 py-1 rounded ${getStatusColor(data.status)}">${data.status}</span>
      </div>
    `;
    list.appendChild(el);
  });
}
