import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, onSnapshot, updateDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const loginForm = document.getElementById("login-form");
const dashboard = document.getElementById("dashboard");
const suggestionsDiv = document.getElementById("suggestions");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginForm.style.display = "none";
      dashboard.style.display = "block";
      loadSuggestions();
    })
    .catch((error) => alert("Login failed! " + error.message));
});

function loadSuggestions() {
  const q = query(collection(db, "suggestions"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    suggestionsDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "bg-white shadow p-4 mb-4 rounded";
      card.innerHTML = `
        <p>${data.text}</p>
        <div class="text-sm text-gray-500">Category: ${data.category}</div>
        <div class="text-sm text-gray-500">Status: ${data.status}</div>
        ${data.fileURL ? `<a href="${data.fileURL}" target="_blank" class="text-blue-500 underline">View Attachment</a>` : ""}
        <div class="flex gap-2 mt-2">
          <button onclick="updateStatus('${doc.id}', 'Pending')" class="status pending">⏳ Pending</button>
          <button onclick="updateStatus('${doc.id}', 'In Progress')" class="status in-progress">🔄 Progress</button>
          <button onclick="updateStatus('${doc.id}', 'Resolved')" class="status resolved">✅ Resolved</button>
        </div>
      `;
      suggestionsDiv.appendChild(card);
    });
  });
}

window.updateStatus = async (id, newStatus) => {
  const ref = doc(db, "suggestions", id);
  await updateDoc(ref, { status: newStatus });
};

const exportBtn = document.getElementById("exportCSV");
if (exportBtn) {
  exportBtn.addEventListener("click", async () => {
    const snapshot = await getDocs(collection(db, "suggestions"));
    let csv = "Text,Category,Status\n";
    snapshot.forEach((doc) => {
      const d = doc.data();
      csv += `"${d.text}","${d.category}","${d.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "suggestions.csv";
    link.click();
  });
}
