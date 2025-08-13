// Hardcoded credentials for demo
const correctUsername = "owner";
const correctPassword = "admin123";

// Handle login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === correctUsername && password === correctPassword) {
    // Hide login section and show dashboard
    document.getElementById("loginSection").style.display = "none";
    document.querySelector("header").style.display = "block";
    document.getElementById("dashboard").style.display = "block";
    showSection("dashboard");
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("show");
});

// Logout behavior
document.getElementById("logoutBtn").addEventListener("click", () => {
  // Hide main system sections
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("productsSection").style.display = "none";
  document.getElementById("purchaseOrders").style.display = "none";
  document.getElementById("stockOut").style.display = "none";
  document.getElementById("reports").style.display = "none";
  document.getElementById("userManagement").style.display = "none";

  // Show login screen
  document.getElementById("loginSection").style.display = "flex";

  // Reset login form
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  // Optional: Notify user
  alert("You have been logged out.");
});

function showSection(id) {
  const sections = [
    "dashboard",
    "productsSection",
    "purchaseOrders",
    "stockOut",
    "reports",
    "userManagement",
  ];
  const navLinks = document.querySelectorAll("nav a");

  // Show/hide relevant section
  sections.forEach((sec) => {
    document.getElementById(sec).style.display = sec === id ? "block" : "none";
  });

  // Highlight active nav item
  navLinks.forEach((link) => {
    const text = link.textContent.trim().toLowerCase().replace(" ", "");
    if (id.toLowerCase().includes(text)) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Set default section
showSection("dashboard");

// Utility: Log activity to dashboard
function logActivity(message) {
  const list = document.getElementById("recentActivityList");

  // Remove "No recent activity"
  if (
    list.children.length === 1 &&
    list.children[0].textContent === "No recent activity"
  ) {
    list.innerHTML = "";
  }

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const entry = document.createElement("li");
  entry.textContent = `[${time}] ${message}`;
  list.prepend(entry);

  // Keep last 10
  if (list.children.length > 10) {
    list.removeChild(list.lastChild);
  }
}

// Update Low Stock section
function updateLowStockTable() {
  const tableBody = document.getElementById("productTableBody");
  const lowStockBody = document.getElementById("lowStockBody");
  if (!lowStockBody || !tableBody) return;

  lowStockBody.innerHTML = "";

  const rows = tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const quantity = parseInt(row.children[2].textContent);
    if (quantity <= 5) {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${row.children[0].textContent}</td>
        <td>${row.children[1].textContent}</td>
        <td class="low">${quantity}</td>
      `;
      lowStockBody.appendChild(newRow);
    }
  });
}

window.addEventListener("DOMContentLoaded", updateLowStockTable);

// Toggle product form
// Show form
document.getElementById("addProductBtn").addEventListener("click", () => {
  document.getElementById("productFormContainer").classList.remove("hidden");
});

// Hide form
document.getElementById("closeForm").addEventListener("click", () => {
  document.getElementById("productFormContainer").classList.add("hidden");
});

// Image preview
function previewImage() {
  const file = document.getElementById("productImage").files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    const img = document.getElementById("previewImg");
    img.src = reader.result;
    img.style.display = "block";
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

let editingRow = null;

document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const category = document.getElementById("productCategory").value.trim();
  const description = document
    .getElementById("productDescription")
    .value.trim();
  const quantity = document.getElementById("productQuantity").value.trim();
  const barcode = document.getElementById("productBarcode").value.trim();

  // Ensure all fields are filled
  if (!category || !description || !quantity || !barcode) {
    alert("Please fill out all fields before submitting.");
    return;
  }

  if (editingRow) {
    editingRow.children[0].textContent = category;
    editingRow.children[1].textContent = description;
    editingRow.children[2].textContent = quantity;
    editingRow.children[3].textContent = barcode;
    logActivity(`Edited product: ${description} (${barcode})`);
    editingRow = null;
  } else {
    const table = document.getElementById("productTableBody");
    const newRow = table.insertRow();

    newRow.innerHTML = `
      <td>${category}</td>
      <td>${description}</td>
      <td>${quantity}</td>
      <td>${barcode}</td>
      <td>
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
      </td>
    `;
    logActivity(`Added product: ${description} (${barcode})`);
  }

  document.getElementById("productForm").reset();
  document.getElementById("productFormContainer").classList.add("hidden");

  filterTable();
  updateLowStockTable();
});

let deletedRowData = null;
let deletedRowIndex = null;
let undoTimeout;
let deletedRowHTML = "";

// Edit/Delete handler
document
  .getElementById("productTableBody")
  .addEventListener("click", function (e) {
    const row = e.target.closest("tr");

    if (e.target.classList.contains("deleteBtn")) {
      const productName = row.children[1].textContent;
      const productBarcode = row.children[3].textContent;

      deletedRowData = Array.from(row.children).map((cell) => cell.textContent);
      deletedRowHTML = row.innerHTML;
      deletedRowIndex = Array.from(row.parentNode.children).indexOf(row);

      row.remove();
      logActivity(`Deleted product: ${productName} (${productBarcode})`);
      showToast();
      updateLowStockTable();
    }

    if (e.target.classList.contains("editBtn")) {
      editingRow = row;
      const cells = row.children;

      document.getElementById("productCategory").value = cells[0].textContent;
      document.getElementById("productDescription").value =
        cells[1].textContent;
      document.getElementById("productQuantity").value = cells[2].textContent;
      document.getElementById("productBarcode").value = cells[3].textContent;

      document
        .getElementById("productFormContainer")
        .classList.remove("hidden");
    }
  });

// Toast for undo
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");

  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    toast.classList.add("hidden");
    deletedRowData = null;
    deletedRowHTML = "";
  }, 5000);
}

document.getElementById("undoBtn").addEventListener("click", () => {
  if (deletedRowData) {
    const tableBody = document.getElementById("productTableBody");
    const newRow = tableBody.insertRow(deletedRowIndex);
    newRow.innerHTML = deletedRowHTML;

    deletedRowData = null;
    deletedRowHTML = "";
    clearTimeout(undoTimeout);
    document.getElementById("toast").classList.add("hidden");

    filterTable();
    updateLowStockTable();
    logActivity("Restored deleted product");
  }
});

// Search + Filter
function filterTable() {
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const selectedCategory =
    document.getElementById("categoryFilter")?.value.toLowerCase() || "";
  const rows = document.querySelectorAll("#productTableBody tr");
  let visibleCount = 0;

  rows.forEach((row) => {
    const category = row.children[0].textContent.toLowerCase();
    const description = row.children[1].textContent.toLowerCase();
    const barcode = row.children[3].textContent.toLowerCase();

    const matchesSearch =
      description.includes(searchValue) || barcode.includes(searchValue);
    const matchesCategory =
      selectedCategory === "" || category === selectedCategory;

    if (matchesSearch && matchesCategory) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  const message = document.getElementById("noResultsMessage");
  if (message) {
    message.classList.toggle("hidden", visibleCount > 0);
  }
}

document.getElementById("searchInput").addEventListener("input", filterTable);
document
  .getElementById("categoryFilter")
  .addEventListener("change", filterTable);

window.addEventListener("DOMContentLoaded", () => {
  // Hide all sections until login
  document.querySelector("header").style.display = "none";
  ["dashboard", "productsSection", "stockOut", "reports"].forEach((sec) => {
    document.getElementById(sec).style.display = "none";
  });
});

let stockOutList = [];

function addStockOutItem() {
  const code = document.getElementById("so-code").value.trim();
  const barcode = document.getElementById("so-barcode").value.trim();
  const description = document.getElementById("so-desc").value.trim();
  const qty = parseInt(document.getElementById("so-qty").value);

  if (!code || !barcode || !description || !qty || qty <= 0) {
    alert("Please fill all item fields correctly.");
    return;
  }

  stockOutList.push({ code, barcode, description, qty });
  renderStockOutTable();

  document.getElementById("so-code").value = "";
  document.getElementById("so-barcode").value = "";
  document.getElementById("so-desc").value = "";
  document.getElementById("so-qty").value = 1;
}

function renderStockOutTable() {
  const tbody = document.querySelector("#stockout-item-table tbody");
  tbody.innerHTML = "";
  stockOutList.forEach((item, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${item.code}</td>
        <td>${item.barcode}</td>
        <td>${item.description}</td>
        <td>${item.qty}</td>
        <td><button onclick="removeStockOutItem(${i})">Remove</button></td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function removeStockOutItem(index) {
  stockOutList.splice(index, 1);
  renderStockOutTable();
}

function submitStockOut() {
  const date = document.getElementById("so-date").value;
  const customer = document.getElementById("so-customer").value.trim();
  const order = document.getElementById("so-order").value.trim();

  if (!date || !customer || !order || stockOutList.length === 0) {
    alert("Fill all fields and add at least one item.");
    return;
  }

  const safeCustomer = customer.replace(/\s+/g, "_");
  const filename = `StockOut_${order}_${date}_${safeCustomer}.xlsx`;

  const data = [
    ["Code", "Barcode", "Description", "Quantity"],
    ...stockOutList.map((item) => [
      item.code,
      item.barcode,
      item.description,
      item.qty,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Out List");
  XLSX.writeFile(wb, filename);

  saveStockOutRecord({ date, customer, order, filename });
  resetStockOutForm();
  renderStockOutRecords();
}

function resetStockOutForm() {
  stockOutList = [];
  renderStockOutTable();
  document.getElementById("so-date").value = "";
  document.getElementById("so-customer").value = "";
  document.getElementById("so-order").value = "";
}

function saveStockOutRecord(record) {
  const records = JSON.parse(localStorage.getItem("stockout_records") || "[]");
  records.push(record);
  localStorage.setItem("stockout_records", JSON.stringify(records));
}

function renderStockOutRecords() {
  const records = JSON.parse(localStorage.getItem("stockout_records") || "[]");
  const tbody = document.querySelector("#stockout-records-table tbody");
  tbody.innerHTML = "";
  records.forEach((r) => {
    const row = `
      <tr>
        <td>${r.date}</td>
        <td>${r.customer}</td>
        <td>${r.order}</td>
        <td>${r.filename}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

window.addEventListener("DOMContentLoaded", renderStockOutRecords);
function addStockOutItem() {
  const code = document.getElementById("so-code").value;
  const barcode = document.getElementById("so-barcode").value;
  const desc = document.getElementById("so-desc").value;
  const qty = document.getElementById("so-qty").value;

  if (!code || !barcode || !desc || !qty) {
    alert("Please fill all fields.");
    return;
  }

  const tableBody = document.querySelector("#stockout-item-table tbody");
  const row = document.createElement("tr");

  row.classList.add("stockout-row-animate"); // 🔥 Add animation

  row.innerHTML = `
    <td>${tableBody.children.length + 1}</td>
    <td>${code}</td>
    <td>${barcode}</td>
    <td>${desc}</td>
    <td>${qty}</td>
    <td><button onclick="this.closest('tr').remove()">Remove</button></td>
  `;

  tableBody.appendChild(row);

  // Optional: Clear input fields
  document.getElementById("so-code").value = "";
  document.getElementById("so-barcode").value = "";
  document.getElementById("so-desc").value = "";
  document.getElementById("so-qty").value = "";
}

document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("userRole").value;

  const user = {
    username,
    password,
    role,
    status: "Active",
  };

  users.push(user);
  renderUserList();
  this.reset();
});

const users = [];

function renderUserList() {
  const tbody = document.getElementById("userList");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>${user.status}</td>
      <td>
        <button class="reset" onclick="resetPassword(${index})">Reset</button>
        <button class="${
          user.status === "Active" ? "deactivate" : "activate"
        }" onclick="toggleStatus(${index})">
          ${user.status === "Active" ? "Deactivate" : "Activate"}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function resetPassword(index) {
  const newPass = prompt("Enter new password for user:");
  if (newPass) {
    users[index].password = newPass;
    alert("Password reset successfully.");
  }
}

function toggleStatus(index) {
  users[index].status =
    users[index].status === "Active" ? "Inactive" : "Active";
  renderUserList();
}

// Sample saved orders - in real case, fetch from localStorage or server
let purchaseOrders = JSON.parse(
  localStorage.getItem("sent_purchase_orders") || "[]"
);

// Renders the purchase orders table
function renderPurchaseOrders() {
  const tbody = document.getElementById("poList");
  tbody.innerHTML = "";

  if (purchaseOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No purchase orders found.</td></tr>`;
    return;
  }

  purchaseOrders.forEach((order, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${order.customer}</td>
      <td>${order.dateTime}</td>
      <td><a href="${order.fileUrl}" download>${order.filename}</a></td>
      <td>
        <select onchange="updateOrderStatus(${index}, this.value)">
          <option ${
            order.status === "Pending" ? "selected" : ""
          }>Pending</option>
          <option ${
            order.status === "Approved" ? "selected" : ""
          }>Approved</option>
        </select>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// Update status
function updateOrderStatus(index, newStatus) {
  purchaseOrders[index].status = newStatus;
  localStorage.setItem("sent_purchase_orders", JSON.stringify(purchaseOrders));
  renderPurchaseOrders();
}

// Initialize on load
window.addEventListener("DOMContentLoaded", renderPurchaseOrders);

// This function will be called when a file is selected in the input
function previewImage(event) {
  // Get the selected file from the input event
  const fileInput = event.target;
  const file = fileInput.files[0]; // Get the first file selected

  // Get the <img> element where the preview will be displayed
  const previewImg = document.getElementById("previewImg");

  if (file) {
    // Create a FileReader object
    const reader = new FileReader();

    // Set up what happens when the FileReader finishes loading the file
    reader.onload = function (e) {
      // Set the src of the <img> element to the base64 encoded image data
      previewImg.src = e.target.result;
      // Make sure the image is visible
      previewImg.style.display = "block";
    };

    // Read the image file as a Data URL (base64 encoded string)
    reader.readAsDataURL(file);
  } else {
    previewImg.src = "";
    previewImg.style.display = "none";
  }
}

// Optional: Add event listeners if you prefer not to use onchange directly in HTML
document.addEventListener("DOMContentLoaded", function () {
  const productImageInput = document.getElementById("productImageInput");
  if (productImageInput) {
    productImageInput.addEventListener("change", previewImage);
  }
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent default form submission

      const category = document.getElementById("productCategory").value;
      const description = document.getElementById("productDescription").value;
      const quantity = document.getElementById("productQuantity").value;
      const barcode = document.getElementById("productBarcode").value;
      const imageFile = document.getElementById("productImageInput").files[0];

      console.log("Form Data:", {
        category,
        description,
        quantity,
        barcode,
        imageFile, // This is the File object, you'd send this via FormData
      });

      document.getElementById("productFormContainer").classList.add("hidden");
    });
  }

  // Event listener for the close button
  const closeFormBtn = document.getElementById("closeForm");
  const productFormContainer = document.getElementById("productFormContainer");

  if (closeFormBtn && productFormContainer) {
    closeFormBtn.addEventListener("click", function () {
      productFormContainer.classList.add("hidden");
      // Optionally clear the form when closed
      productForm.reset();
      // Also clear the image preview
      document.getElementById("previewImg").src = "";
      document.getElementById("previewImg").style.display = "none";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("productForm");

  // Load all products when page is ready
  loadProducts();

  // Handle product form submission
  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const category = document.getElementById("productCategory").value;
      const description = document.getElementById("productDescription").value;
      const quantity = parseInt(
        document.getElementById("productQuantity").value
      );
      const barcode = document.getElementById("productBarcode").value;

      const product = {
        category,
        description,
        quantity,
        barcode,
      };

      try {
        const response = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Something went wrong");
        }

        const saved = await response.json();
        alert("✅ Product added: " + saved.description);
        productForm.reset();
        document.getElementById("productFormContainer").classList.add("hidden");
        loadProducts(); // Refresh table
      } catch (err) {
        alert("❌ Error: " + err.message);
      }
    });
  }
});

// Load and display all products in the table
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products");
    const products = await res.json();

    const tbody = document.getElementById("productTableBody");
    const noResults = document.getElementById("noResultsMessage");

    tbody.innerHTML = ""; // Clear existing rows

    if (products.length === 0) {
      noResults.classList.remove("hidden");
      return;
    }

    noResults.classList.add("hidden");

    products.forEach((product, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${product.category}</td>
          <td>${product.description}</td>
          <td>${product.quantity}</td>
          <td>${product.barcode}</td>
          <td>
            <button onclick="deleteProduct('${product._id}')">Delete</button>
          </td>
        `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

// Delete a product by ID
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("🗑️ Product deleted");
      loadProducts(); // Refresh after deletion
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || "Delete failed");
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}
