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

// Render a suggestion card
function renderCard(id, data) {
  const card = document.createElement("div");
  const colorClass = {
    "Pending": "bg-yellow-50",
    "Initiated": "bg-purple-50",
    "In Progress": "bg-blue-50",
    "Success": "bg-teal-50",
    "Resolved": "bg-green-50"
  }[data.status] || "bg-yellow-50";

  const badgeClass = {
    "Pending": "bg-yellow-100 text-yellow-700",
    "Initiated": "bg-purple-100 text-purple-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Success": "bg-teal-100 text-teal-700",
    "Resolved": "bg-green-100 text-green-700"
  }[data.status] || "bg-yellow-100 text-yellow-700";

  card.className = `p-4 rounded shadow ${colorClass}`;

  card.innerHTML = `
    <p class="mb-2">${data.text}</p>
    <p class="text-sm text-gray-700 mb-1">Type: <strong>${data.type || "N/A"}</strong></p>
    <div class="text-sm text-gray-600 mb-1">Category: ${data.category}</div>
    <div class="text-sm font-medium mb-2">Status: 
      <span class="px-2 py-1 rounded ${badgeClass}">${data.status}</span>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      ${["Pending", "Initiated", "In Progress", "Success", "Resolved"].map(status =>
        `<button onclick="updateStatus('${id}', '${status}')" class="${getStatusButtonClass(status)}">${getStatusLabel(status)}</button>`
      ).join("")}
    </div>
  `;

  container.appendChild(card);
}

// Status button styling
function getStatusButtonClass(status) {
  const colorMap = {
    "Pending": "bg-yellow-500 hover:bg-yellow-600",
    "Initiated": "bg-purple-500 hover:bg-purple-600",
    "In Progress": "bg-blue-500 hover:bg-blue-600",
    "Success": "bg-teal-500 hover:bg-teal-600",
    "Resolved": "bg-green-500 hover:bg-green-600"
  };
  return `${colorMap[status]} text-white px-3 py-1 rounded text-sm`;
}

// Status button icon+label
function getStatusLabel(status) {
  const iconMap = {
    "Pending": "⏳ Pending",
    "Initiated": "🚀 Initiated",
    "In Progress": "🔄 In Progress",
    "Success": "🎯 Success",
    "Resolved": "✅ Resolved"
  };
  return iconMap[status];
}

// Load suggestions
async function loadSuggestions(keyword = "") {
  try {
    const snapshot = await getDocs(query(collection(db, "suggestions"), orderBy("timestamp", "desc")));
    container.innerHTML = "";

    const counts = {
      Pending: 0,
      Initiated: 0,
      "In Progress": 0,
      Success: 0,
      Resolved: 0
    };

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      if (keyword && !data.text?.toLowerCase().includes(keyword.toLowerCase())) return;

      counts[data.status] = (counts[data.status] || 0) + 1;
      renderCard(id, data);
    });

    Object.entries(counts).forEach(([status, count]) => {
      const el = document.getElementById(`count${status.replace(/\s/g, "")}`);
      if (el) el.textContent = count;
    });
  } catch (err) {
    console.error("❌ Error loading suggestions:", err);
    container.innerHTML = "<p class='text-red-600'>🚨 Failed to load data</p>";
  }
}

// Update status
window.updateStatus = async (id, status) => {
  try {
    const ref = doc(db, "suggestions", id);
    await updateDoc(ref, { status });
    alert(`✅ Status updated to "${status}"`);
    loadSuggestions(searchInput.value);
  } catch (err) {
    console.error("❌ Failed to update status:", err);
    alert("🚨 Could not update status");
  }
};

// Export to CSV
document.getElementById("exportCSV").addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "suggestions"));
  let csv = "Text,Type,Category,Status\n";
  snapshot.forEach(doc => {
    const d = doc.data();
    csv += `"${d.text.replace(/"/g, '""')}","${d.type || "N/A"}","${d.category}","${d.status}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "suggestions.csv";
  link.click();
});

// Search input listener
searchInput.addEventListener("input", (e) => {
  loadSuggestions(e.target.value);
});

// Initial load
loadSuggestions();

