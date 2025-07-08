// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Suggestion Form Submission
const form = document.getElementById("suggestionForm");
const statusBox = document.getElementById("submissionStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusBox.textContent = "⏳ Status: Submission in progress...";
  statusBox.className = "mt-4 text-sm text-yellow-600";

  const text = form.querySelector("textarea").value.trim();
  const category = form.querySelector("select").value;

  if (!text || !category) {
    statusBox.textContent = "❌ Status: Please fill all fields";
    statusBox.className = "mt-4 text-sm text-red-600";
    return;
  }

  try {
    await addDoc(collection(db, "suggestions"), {
      text,
      category,
      status: "Pending",
      timestamp: serverTimestamp()
    });

    statusBox.textContent = "✅ Status: Suggestion successfully submitted!";
    statusBox.className = "mt-4 text-sm text-green-600";
    form.reset();
  } catch (err) {
    console.error("Submission Error:", err);
    statusBox.textContent = "❌ Status: Submission failed — please try again.";
    statusBox.className = "mt-4 text-sm text-red-600";
  }

  // Optional: Hide status after 5 seconds
  setTimeout(() => {
    statusBox.textContent = "";
  }, 5000);
});

// Admin Login
const adminForm = document.getElementById("adminForm");

adminForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = adminForm.querySelector('input[type="email"]').value;
  const password = adminForm.querySelector('input[type="password"]').value;

  if (email === "admin@vnrvjiet.ac.in" && password === "admin123") {
    window.location.href = "admin.html";
  } else {
    alert("❌ Invalid credentials");
  }
});
