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

// Fetch and display suggestions
async function loadSuggestions() {
  const q = query(collection(db, "suggestions"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p class='text-gray-500'>No suggestions found.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";

    card.innerHTML = `
      <p class="mb-2">${data.text}</p>
      <div class="text-sm text-gray-600 mb-1">Category: ${data.category}</div>
      <div class="text-sm font-medium mb-2">Status: 
        <span class="px-2 py-1 rounded ${
          data.status === "Resolved" ? "bg-green-100 text-green-700" :
          data.status === "In Progress" ? "bg-blue-100 text-blue-700" :
          data.status === "Initiated" ? "bg-purple-100 text-purple-700" :
          data.status === "Success" ? "bg-teal-100 text-teal-700" :
          "bg-yellow-100 text-yellow-700"
        }">${data.status}</span>
      </div>
      ${data.fileURL ? `<a href="${data.fileURL}" target="_blank" class="text-blue-600 underline text-sm mb-2 inline-block">📎 View Evidence</a>` : ""}
      <div class="flex flex-wrap gap-2 mt-2">
        <button onclick="updateStatus('${id}', 'Pending')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">⏳ Pending</button>
        <button onclick="updateStatus('${id}', 'In Progress')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">🔄 In Progress</button>
        <button onclick="updateStatus('${id}', 'Initiated')" class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">🚀 Initiated</button>
        <button onclick="updateStatus('${id}', 'Success')" class="bg-teal-500 text-white px-3 py-1 rounded text-sm hover:bg-teal-600">🎯 Success</button>
        <button onclick="updateStatus('${id}', 'Resolved')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">✅ Resolved</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Update Firestore status
window.updateStatus = async (id, status) => {
  try {
    const ref = doc(db, "suggestions", id);
    await updateDoc(ref, { status });
    alert(`✅ Status updated to "${status}"`);
    loadSuggestions();
  } catch (err) {
    console.error("Failed to update status:", err);
    alert("❌ Could not update suggestion status");
  }
};

// Export suggestions to CSV
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

// Initial load
loadSuggestions();
