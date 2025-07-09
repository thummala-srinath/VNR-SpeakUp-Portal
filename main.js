import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const form = document.getElementById("suggestionForm");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = document.getElementById("text").value.trim();
  const category = document.getElementById("category").value;
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  statusMsg.textContent = "Submitting...";
  statusMsg.className = "text-yellow-500 text-center";

  let fileURL = "";
  if (file) {
    const storageRef = ref(storage, `evidence/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    fileURL = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "suggestions"), {
    text,
    category,
    status: "Pending",
    timestamp: serverTimestamp(),
    fileURL
  });

  statusMsg.textContent = "✅ Suggestion submitted successfully!";
  statusMsg.className = "text-green-600 text-center";
  form.reset();
});
