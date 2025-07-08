const countDocsByStatus = async (status) => {
  const q = query(collection(db, "suggestions"), where("status", "==", status));
  const snapshot = await getDocs(q);
  return snapshot.size;
};
