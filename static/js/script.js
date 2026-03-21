console.log("JS Loaded ✅");
function createNotification(type, title, message) {
  const container = document.getElementById("notification-container");

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;

  notif.innerHTML = `
    <img src="assets/logo.png" alt="logo" />
    <div class="content">
      <div class="title">${title}</div>
      <div class="message">${message}</div>
    </div>
  `;

  container.appendChild(notif);

  // Auto remove after 5 sec
  setTimeout(() => {
    notif.remove();
  }, 5000);
}

// 🔥 Trigger all notifications (for testing)
function triggerAll() {

  // 1. Order
  createNotification(
    "info",
    "Reorder Alert",
    "Paracetamol stock low. Order sent to warehouse."
  );

  // 2. Receipt
  setTimeout(() => {
    createNotification(
      "success",
      "Stock Updated",
      "50 units of Amoxicillin added."
    );
  }, 800);

  // 3. Low Stock
  setTimeout(() => {
    createNotification(
      "low",
      "Low Stock",
      "Only 5 units of Ibuprofen remaining."
    );
  }, 1600);

  // 4. Expiry
  setTimeout(() => {
    createNotification(
      "warning",
      "Expiry Warning",
      "Insulin expires in 3 days."
    );
  }, 2400);

  // 5. Recall
  setTimeout(() => {
    createNotification(
      "critical",
      "Drug Recall 🚨",
      "Batch #X92 of Metformin recalled."
    );
  }, 3200);

  // 6. Outbreak
  setTimeout(() => {
    createNotification(
      "critical",
      "Outbreak Alert 🦠",
      "Dengue rising. Increase stock immediately."
    );
  }, 4000);
}