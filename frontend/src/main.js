const API_URL = "http://localhost:5000/api/users";

let currentRole = null;
let chartInstance = null;

document.addEventListener("DOMContentLoaded", () => {

  const adminBtn = document.getElementById("adminBtn");
  const userBtn = document.getElementById("userBtn");
  const submitBtn = document.getElementById("submitBtn");
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const backBtn = document.getElementById("backBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const backHomeBtn = document.getElementById("backHomeBtn");

  // ================= ROLE SELECT =================

  adminBtn.addEventListener("click", () => {
    document.getElementById("roleSelect").style.display = "none";
    document.getElementById("adminLogin").style.display = "block";
  });

  userBtn.addEventListener("click", () => {
    currentRole = "user";
    loadDashboard();
  });

  backBtn.addEventListener("click", () => {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("roleSelect").style.display = "block";
  });

  adminLoginBtn.addEventListener("click", adminLogin);
  submitBtn.addEventListener("click", handleAddUser);

  // ================= NAVIGATION =================

  logoutBtn.addEventListener("click", goHome);
  backHomeBtn.addEventListener("click", goHome);
});


// ================= HOME RESET =================

function goHome() {
  currentRole = null;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("navbar").style.display = "none";
  document.getElementById("roleSelect").style.display = "block";
}


// ================= ADMIN LOGIN =================

async function adminLogin() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  const res = await fetch(`${API_URL}/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.message);
    return;
  }

  currentRole = "admin";
  document.getElementById("adminLogin").style.display = "none";
  loadDashboard();
}


// ================= DASHBOARD =================

function loadDashboard() {
  document.getElementById("roleSelect").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("navbar").style.display = "flex";
  document.getElementById("adminSection").style.display = "block";

  fetchUsers();
}


// ================= FETCH USERS =================

async function fetchUsers() {
  const res = await fetch(API_URL);
  const users = await res.json();

  document.getElementById("userCount").innerText = users.length;

  const tableBody = document.getElementById("userTableBody");
  tableBody.innerHTML = "";

  const roleCount = {};

  users.forEach(user => {

    roleCount[user.role] = (roleCount[user.role] || 0) + 1;

    const row = document.createElement("tr");

    const roleBadge =
      user.role === "admin"
        ? `<span class="role-badge admin-badge">Admin</span>`
        : `<span class="role-badge user-badge">User</span>`;

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${roleBadge}</td>
      <td></td>
    `;

    // Only Admin sees edit/delete
    if (currentRole === "admin") {
      const actionCell = row.children[3];

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editUser(user._id));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("danger-btn");
      deleteBtn.addEventListener("click", () => deleteUser(user._id));

      actionCell.appendChild(editBtn);
      actionCell.appendChild(deleteBtn);
    }

    tableBody.appendChild(row);
  });

  // Chart only for Admin
  if (currentRole === "admin") {
    document.querySelector(".chart-title").style.display = "block";
    document.getElementById("roleChart").style.display = "block";
    renderChart(roleCount);
  } else {
    document.querySelector(".chart-title").style.display = "none";
    document.getElementById("roleChart").style.display = "none";
  }
}


// ================= ADD USER =================

async function handleAddUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role: "user" })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Email already exists");
      return;
    }

    alert("User added!");

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";

    fetchUsers();

  } catch (err) {
    alert("Something went wrong");
  }
}


// ================= DELETE =================

async function deleteUser(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  alert("User deleted");
  fetchUsers();
}


// ================= EDIT =================

function editUser(id) {
  fetch(API_URL)
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u._id === id);
      if (!user) return;

      const tableBody = document.getElementById("userTableBody");
      const rows = tableBody.querySelectorAll("tr");

      rows.forEach(row => {
        if (row.children[0].textContent === user.name) {

          row.innerHTML = `
            <td><input value="${user.name}" id="editName-${id}" /></td>
            <td><input value="${user.email}" id="editEmail-${id}" /></td>
            <td>${user.role}</td>
            <td>
              <button id="save-${id}">Save</button>
              <button id="cancel-${id}" class="danger-btn">Cancel</button>
            </td>
          `;

          document.getElementById(`save-${id}`)
            .addEventListener("click", () => saveUser(id));

          document.getElementById(`cancel-${id}`)
            .addEventListener("click", fetchUsers);
        }
      });
    });
}

async function saveUser(id) {
  const name = document.getElementById(`editName-${id}`).value.trim();
  const email = document.getElementById(`editEmail-${id}`).value.trim();

  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  });

  alert("User updated!");
  fetchUsers();
}


// ================= CHART =================

function renderChart(roleCount) {
  const ctx = document.getElementById("roleChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(roleCount),
      datasets: [{
        data: Object.values(roleCount),
        backgroundColor: "rgba(59,130,246,0.7)",
        borderRadius: 6
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}