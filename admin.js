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

// Preview evidence based on file type
function previewAttachment(url) {
  if (url.match(/\.(jpg|jpeg|png)$/)) {
    return `<img src="${url}" alt="Evidence" class="mt-2 max-h-40 rounded shadow" />`;
  } else if (url.endsWith(".pdf")) {
    return `<a href="${url}" target="_blank" class="text-blue-600 underline text-sm mb-2 inline-block">📄 View PDF Evidence</a>`;
  } else if (url.match(/\.(mp4|webm|ogg)$/)) {
    return `<video controls class="mt-2 max-h-48 rounded shadow"><source src="${url}" type="video/mp4">Your browser does not support video.</video>`;
  } else {
    return `<a href="${url}" target="_blank" class="text-blue-600 underline text-sm mb-2 inline-block">📎 View Attachment</a>`;
  }
}

// Render a suggestion card
function renderCard(id, data) {
  const card = document.createElement("div");
  card.className = `p-4 rounded shadow bg-white border`;

  card.innerHTML = `
    <p class="mb-2 text-gray-800">${data.text}</p>
    <div class="text-sm text-gray-600 mb-1">Type: ${data.type || 'Suggestion'}</div>
    <div class="text-sm text-gray-600 mb-1">Category: ${data.category}</div>
    <label class="text-sm font-medium mt-2 block">Status:</label>
    <input type="text" value="${data.status || ''}" id="status-${id}" class="border p-1 w-full rounded mb-2" />
    <label class="text-sm font-medium">Admin Comment:</label>
    <textarea id="comment-${id}" class="border p-1 w-full rounded mb-2" placeholder="Enter your comment...">${data.comment || ''}</textarea>
    <button onclick="updateStatus('${id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">💾 Save</button>
    ${data.fileURL ? previewAttachment(data.fileURL) : ""}
  `;

  container.appendChild(card);
}

// Load suggestions and count
async function loadSuggestions(keyword = "") {
  try {
    const snapshot = await getDocs(query(collection(db, "suggestions"), orderBy("timestamp", "desc")));
    container.innerHTML = "";
    console.log("🔎 Loaded", snapshot.size, "suggestions");

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      if (keyword && !data.text?.toLowerCase().includes(keyword.toLowerCase())) return;
      renderCard(id, data);
    });
  } catch (err) {
    console.error("❌ Error loading suggestions:", err);
    container.innerHTML = "<p class='text-red-600'>🚨 Failed to load data</p>";
  }
}

// Update status and comment
window.updateStatus = async (id) => {
  try {
    const status = document.getElementById(`status-${id}`).value;
    const comment = document.getElementById(`comment-${id}`).value;
    const ref = doc(db, "suggestions", id);
    await updateDoc(ref, { status, comment });
    alert(`✅ Updated successfully`);
    loadSuggestions(searchInput.value);
  } catch (err) {
    console.error("❌ Failed to update:", err);
    alert("🚨 Could not update");
  }
};

// Export to CSV
const exportBtn = document.getElementById("exportCSV");
if (exportBtn) {
  exportBtn.addEventListener("click", async () => {
    const snapshot = await getDocs(collection(db, "suggestions"));
    let csv = "Text,Type,Category,Status,Comment\n";
    snapshot.forEach(doc => {
      const d = doc.data();
      csv += `"${d.text.replace(/"/g, '""')}","${d.type || ''}","${d.category}","${d.status || ''}","${d.comment || ''}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "suggestions.csv";
    link.click();
  });
}

// Search
searchInput.addEventListener("input", (e) => {
  loadSuggestions(e.target.value);
});

// Initial
loadSuggestions();
