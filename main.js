import { db, storage } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const form = document.getElementById("suggestionForm");
const statusBox = document.getElementById("submissionStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusBox.textContent = "⏳ Uploading...";
  statusBox.className = "text-yellow-600";

  const text = form.querySelector("textarea").value.trim();
  const category = form.querySelector("select").value;
  const file = document.getElementById("fileInput").files[0];
  if (!text || !category) return statusBox.textContent = "❌ Fill all fields";

  let fileURL = null;
  if (file) {
    const fileRef = ref(storage, `evidence/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    fileURL = await getDownloadURL(fileRef);
  }

  await addDoc(collection(db, "suggestions"), {
    text, category, status: "Pending", fileURL,
    timestamp: serverTimestamp()
  });

  statusBox.textContent = "✅ Submitted successfully!";
  statusBox.className = "text-green-600";
  form.reset();
  setTimeout(() => (statusBox.textContent = ""), 5000);
});
