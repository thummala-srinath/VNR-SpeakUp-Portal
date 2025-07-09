import { db } from './firebase-config.js';
import {
  collection, getDocs, updateDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("suggestions");

async function loadSuggestions() {
  const q = query(collection(db, "suggestions"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "bg-white p-4 shadow rounded mb-4";

    card.innerHTML = `
      <p>${data.text}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      ${data.fileURL ? `<a href="${data.fileURL}" target="_blank" class="text-blue-600">📎 View Evidence</a>` : ""}
      <div class="mt-2 space-x-2">
        <button onclick="updateStatus('${id}', 'Pending')" class="px-2 py-1 bg-yellow-500 text-white rounded">⏳ Pending</button>
        <button onclick="updateStatus('${id}', 'In Progress')" class="px-2 py-1 bg-blue-500 text-white rounded">🔄 In Progress</button>
        <button onclick="updateStatus('${id}', 'Resolved')" class="px-2 py-1 bg-green-500 text-white rounded">✅ Resolved</button>
      </div>
    `;

    container.appendChild(card);
  });
}

window.updateStatus = async (id, status) => {
  const ref = doc(db, "suggestions", id);
  await updateDoc(ref, { status });
  loadSuggestions();
};

loadSuggestions();
