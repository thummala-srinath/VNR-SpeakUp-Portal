card.innerHTML = `
  <p>${data.text}</p>
  <div class="text-sm text-gray-500">Category: ${data.category}</div>
  <div class="flex gap-2 mt-2">
    <button onclick="updateStatus('${doc.id}', 'Pending')" class="status pending">⏳ Pending</button>
    <button onclick="updateStatus('${doc.id}', 'In Progress')" class="status in-progress">🔄 Progress</button>
    <button onclick="updateStatus('${doc.id}', 'Resolved')" class="status resolved">✅ Resolved</button>
  </div>
`;
card.innerHTML = `
  <p>${data.text}</p>
  <div class="text-sm text-gray-500">Category: ${data.category}</div>
  <div class="flex gap-2 mt-2">
    <button onclick="updateStatus('${doc.id}', 'Pending')" class="status pending">⏳ Pending</button>
    <button onclick="updateStatus('${doc.id}', 'In Progress')" class="status in-progress">🔄 Progress</button>
    <button onclick="updateStatus('${doc.id}', 'Resolved')" class="status resolved">✅ Resolved</button>
  </div>
`;
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
