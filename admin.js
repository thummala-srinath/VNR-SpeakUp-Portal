import { db } from './firebase-config.js';
import {
  collection, getDocs, updateDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("suggestions");
const searchInput = document.getElementById("searchInput");

function renderCard(id, data) {
  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded shadow";

  card.innerHTML = `
    <p class="mb-2">${data.text}</p>
    <p class="text-sm text-gray-600">Category: ${data.category}</p>
    <p class="text-sm font-semibold">Status: ${data.status}</p>
    ${data.fileURL ? `<a href="${data.fileURL}" class="text-blue-600 underline text-sm mt-2 inline-block" target="_blank">View Attachment</a>` : ""}
    <div class="mt-2 flex gap-2 flex-wrap">
      ${["Pending", "Initiated", "In Progress", "Success", "Resolved"].map(status => `
        <button onclick="updateStatus('${id}', '${status}')" class="bg-blue-500 text-white text-sm px-2 py-1 rounded hover:bg-blue-600">${status}</button>
      `).join("")}
    </div>
  `;
  container.appendChild(card);
}

async function loadSuggestions(keyword = "") {
  container.innerHTML = "";
  const snapshot = await getDocs(query(collection(db, "suggestions"), orderBy("timestamp", "desc")));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    if (!keyword || data.text.toLowerCase().includes(keyword.toLowerCase())) {
      renderCard(id, data);
    }
  });
}

searchInput.addEventListener("input", e => loadSuggestions(e.target.value));

window.updateStatus = async (id, status) => {
  await updateDoc(doc(db, "suggestions", id), { status });
  loadSuggestions(searchInput.value);
};

document.getElementById("exportCSV").addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "suggestions"));
  let csv = "Text,Category,Status\n";
  snapshot.forEach(doc => {
    const d = doc.data();
    csv += `"${d.text}","${d.category}","${d.status}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "suggestions.csv";
  link.click();
});

loadSuggestions();
