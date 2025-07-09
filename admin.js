import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("suggestions");
const searchInput = document.getElementById("searchInput");

// Render card for each suggestion
function renderCard(id, data) {
  const card = document.createElement("div");
  card.className = `p-4 rounded shadow ${
    data.status === "Resolved" ? "bg-green-50" :
    data.status === "Success" ? "bg-teal-50" :
    data.status === "Initiated" ? "bg-purple-50" :
    data.status === "In Progress" ? "bg-blue-50" :
    "bg-yellow-50"
  }`;

  card.innerHTML = `
    <p class="mb-2">${data.text}</p>
    <div class="text-sm text-gray-600 mb-1">Category: ${data.category}</div>
    <div class="text-sm font-medium mb-2">Status: 
      <span class="px-2 py-1 rounded ${
        data.status === "Resolved" ? "bg-green-100 text-green-700" :
        data.status === "Success" ? "bg-teal-100 text-teal-700" :
        data.status === "Initiated" ? "bg-purple-100 text-purple-700" :
        data.status === "In Progress" ? "bg-blue-100 text-blue-700" :
        "bg-yellow-100 text-yellow-700"
      }">${data.status}</span>
    </div>
    ${data.fileURL ? previewAttachment(data.fileURL) : ""}
    <div class="flex flex-wrap gap-2 mt-2">
      <button onclick="updateStatus('${id}', 'Pending')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">⏳ Pending</button>
      <button onclick="updateStatus('${id}', 'Initiated')" class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">🚀 Initiated</button>
      <button onclick="updateStatus('${id}', 'In Progress')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">🔄 In Progress</button>
      <button onclick="updateStatus('${id}', 'Success')" class="bg-teal-500 text-white px-3 py-1 rounded text-sm hover:bg-teal-600">🎯 Success</button>
      <button onclick="updateStatus('${id}', 'Resolved')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">✅ Resolved</button>
    </div>
  `;

  container.appendChild(card);
}

// Load suggestions and count statuses
async function loadSuggestions(keyword = "") {
  const snapshot = await getDocs(query(collection(db, "suggestions"), orderBy("timestamp", "desc")));
  container.innerHTML = "";

  let counts = {
    Pending: 0,
    Initiated: 0,
    "In Progress": 0,
    Success: 0,
    Resolved: 0
  };

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (keyword && !data.text.toLowerCase().includes(keyword.toLowerCase())) return;

    counts[data.status] = (counts[data.status] || 0) + 1;
    renderCard(docSnap.id, data);
  });

  Object.keys(counts).forEach(status => {
    const el = document.getElementById(`count${status.replace(/\s/g, "")}`);
    if (el) el.textContent = counts[status];
  });
}

// Evidence preview
function previewAttachment(url) {
  if (url.match(/\.(jpg|jpeg|png)$/)) {
    return `<img src="${url}" alt="Evidence" class="mt-2 max-h-40 rounded shadow" />`;
  } else if (url.endsWith(".pdf")) {
    return `<a href="${url}" target="_blank" class="text-blue-600 underline text-sm mb-2 inline-block">📄 View PDF Evidence</a>`;
  } else {
    return `<a href="${url}" target="_blank" class="text-blue-600 underline text-sm mb-2 inline-block">📎 View Attachment</a>`;
  }
}

// Status update
window.updateStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, "suggestions", id), { status });
    alert(`✅ Status updated to "${status}"`);
    loadSuggestions(searchInput.value);
  } catch (err) {
    console.error(err);
    alert("❌ Failed to update status");
  }
};

// CSV export
document.getElementById("exportCSV").addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "suggestions"));
  let csv = "Text,Category,Status\n";
  snapshot.forEach(doc => {
    const d = doc.data();
    csv += `"${d.text.replace(/"/g, '""')}","${d.category}","${d.status}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "suggestions.csv";
  link.click();
});

// Search input
searchInput.addEventListener("input", (e) => {
  loadSuggestions(e.target.value);
});

// Initial load
loadSuggestions();
