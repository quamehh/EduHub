// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyABrQBzDxdvperveW4a5Ax9xQcV8tbnTkRk",
  authDomain: "jhs-alumni-portal.firebaseapp.com",
  databaseURL: "https://jhs-alumni-portal-default-rtdb.firebaseio.com",
  projectId: "jhs-alumni-portal",
  storageBucket: "jhs-alumni-portal.appspot.com",
  messagingSenderId: "450708721744",
  appId: "1:450708721744:web:35413d5ac7940b1dc70155"
};

// Configure Access Passwords
const PASSWORDS = {
  admin: "admin2026",
  member: "member2026"
};

// Initial Default Data structure
const DEFAULT_PORTAL_DATA = {
  members: [
    { id: 1, name: "Kwaku Mensah" },
    { id: 2, name: "Ama Serwaa" },
    { id: 3, name: "Kofi Owusu" },
    { id: 4, name: "Abena Osei" },
    { id: 5, name: "Yaw Appiah" },
    { id: 6, name: "Akosua Mansa" },
    { id: 7, name: "Kwame Boateng" },
    { id: 8, name: "Yaa Asantewaa" },
    { id: 9, name: "Kwadwo Acheampong" },
    { id: 10, name: "Esi Frimpong" }
  ],
  payments: {
    "October 2026": {
      1: "Paid", 2: "Unpaid", 3: "Paid", 4: "Unpaid", 5: "Unpaid",
      6: "Paid", 7: "Unpaid", 8: "Unpaid", 9: "Paid", 10: "Unpaid"
    }
  }
};

let dbRef = null;
let localPortalData = { members: [], payments: {} };

// Initialize Firebase Realtime Sync
function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  dbRef = firebase.database().ref("alumni_portal_data");

  // Real-time listener: triggers whenever data changes in Firebase
  dbRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      dbRef.set(DEFAULT_PORTAL_DATA);
      localPortalData = DEFAULT_PORTAL_DATA;
    } else {
      localPortalData = data;
      if (!localPortalData.members) localPortalData.members = [];
      if (!localPortalData.payments) localPortalData.payments = {};
    }
    renderAllViews();
  });
}

function getMembers() {
  return localPortalData.members || [];
}

function getPayments() {
  return localPortalData.payments || {};
}

function saveData() {
  if (dbRef) {
    dbRef.set(localPortalData);
  }
}

function getSelectedMonth() {
  const select = document.getElementById("monthSelector");
  return select && select.value ? select.value : "October 2026";
}

function renderAllViews() {
  updateMonthDropdowns();
  renderDashboardSummary();
  renderMemberRoster();
  renderAdminTable();
}

function updateMonthDropdowns() {
  const payments = getPayments();
  const months = Object.keys(payments);
  const select = document.getElementById("monthSelector");

  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = "";

  months.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });

  if (months.includes(currentVal)) {
    select.value = currentVal;
  } else if (months.length > 0) {
    select.value = months[months.length - 1];
  }
}

function renderDashboardSummary() {
  const members = getMembers();
  const payments = getPayments();
  const activeMonth = getSelectedMonth();

  let activeMonthPaid = 0;
  let overallGrandTotal = 0;

  Object.keys(payments).forEach(monthKey => {
    const monthRecord = payments[monthKey] || {};
    members.forEach(m => {
      if (monthRecord[m.id] === "Paid") {
        overallGrandTotal += 20;
        if (monthKey === activeMonth) {
          activeMonthPaid++;
        }
      }
    });
  });

  const activeMonthTotal = activeMonthPaid * 20;
  const activeMonthTarget = members.length * 20;

  const monthTotalEl = document.getElementById("activeMonthFundDisplay");
  if (monthTotalEl) monthTotalEl.innerText = `GHS ${activeMonthTotal.toFixed(2)}`;

  const grandTotalEl = document.getElementById("grandTotalDisplay");
  if (grandTotalEl) grandTotalEl.innerText = `GHS ${overallGrandTotal.toFixed(2)}`;

  const monthlyProgressEl = document.getElementById("monthlyProgressDisplay");
  if (monthlyProgressEl) monthlyProgressEl.innerText = `GHS ${activeMonthTotal} / ${activeMonthTarget}`;

  const paidRatioEl = document.getElementById("paidRatioDisplay");
  if (paidRatioEl) paidRatioEl.innerText = `${activeMonthPaid} / ${members.length} Paid`;

  const progressBar = document.getElementById("progressBar");
  if (progressBar) {
    const pct = activeMonthTarget > 0 ? (activeMonthTotal / activeMonthTarget) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }
}

function renderMemberRoster() {
  const tbody = document.getElementById("memberRosterBody");
  if (!tbody) return;

  const members = getMembers();
  const payments = getPayments();
  const activeMonth = getSelectedMonth();
  const monthRecord = payments[activeMonth] || {};

  tbody.innerHTML = "";

  members.forEach(m => {
    const status = monthRecord[m.id] === "Paid" ? "Paid" : "Unpaid";
    const badgeClass = status === "Paid" ? "badge-paid" : "badge-unpaid";

    tbody.innerHTML += `
      <tr>
        <td><b>${m.name}</b></td>
        <td>${activeMonth}</td>
        <td>GHS 20.00</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  });
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  if (!tbody) return;

  const members = getMembers();
  const payments = getPayments();
  const activeMonth = getSelectedMonth();
  const monthRecord = payments[activeMonth] || {};

  tbody.innerHTML = "";

  members.forEach(m => {
    const status = monthRecord[m.id] === "Paid" ? "Paid" : "Unpaid";
    const badgeClass = status === "Paid" ? "badge-paid" : "badge-unpaid";
    const actionBtn = status === "Paid"
      ? `<button class="btn btn-danger" onclick="togglePaymentStatus(${m.id}, 'Unpaid')">Mark Unpaid</button>`
      : `<button class="btn btn-success" onclick="togglePaymentStatus(${m.id}, 'Paid')">Mark Paid (GHS 20)</button>`;

    const safeName = m.name.replace(/'/g, "\\'");

    tbody.innerHTML += `
      <tr>
        <td>
          <b>${m.name}</b>
          <button class="btn" style="padding: 2px 6px; font-size: 0.75rem; margin-left: 8px; background: #e67e22; color: white;" onclick="promptEditMemberName(${m.id}, '${safeName}')">✏️ Edit</button>
          <button class="btn" style="padding: 2px 6px; font-size: 0.75rem; margin-left: 4px; background: #c0392b; color: white;" onclick="promptDeleteMember(${m.id}, '${safeName}')">🗑️ Delete</button>
        </td>
        <td>${activeMonth}</td>
        <td>GHS 20.00</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
        <td>${actionBtn}</td>
      </tr>
    `;
  });
}

// Admin Action: Toggle Paid / Unpaid
function togglePaymentStatus(memberId, newStatus) {
  const activeMonth = getSelectedMonth();
  if (!localPortalData.payments[activeMonth]) {
    localPortalData.payments[activeMonth] = {};
  }
  localPortalData.payments[activeMonth][memberId] = newStatus;
  saveData();
}

// Admin Action: Add New Member
function addNewMember(name) {
  if (!name.trim()) return;
  const members = getMembers();
  const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;

  localPortalData.members.push({ id: newId, name: name.trim() });
  saveData();
}

// Admin Action: Edit Member Name
function editMemberName(memberId, newName) {
  if (!newName || !newName.trim()) return;
  const member = localPortalData.members.find(m => m.id === memberId);

  if (member) {
    member.name = newName.trim();
    saveData();
  }
}

// Admin Action: Prompt & Delete Member
function promptDeleteMember(memberId, name) {
  if (confirm(`Are you sure you want to delete member "${name}"? This action cannot be undone.`)) {
    deleteMember(memberId);
  }
}

function deleteMember(memberId) {
  // Remove member from member list
  localPortalData.members = localPortalData.members.filter(m => m.id !== memberId);

  // Remove member payment entries across all months
  if (localPortalData.payments) {
    Object.keys(localPortalData.payments).forEach(month => {
      if (localPortalData.payments[month]) {
        delete localPortalData.payments[month][memberId];
      }
    });
  }

  saveData();
}

// Admin Action: Create New Month
function addNewMonthRecord(newMonthName) {
  if (!newMonthName.trim()) return;
  const formattedName = newMonthName.trim();

  if (!localPortalData.payments[formattedName]) {
    localPortalData.payments[formattedName] = {};
    saveData();

    setTimeout(() => {
      const select = document.getElementById("monthSelector");
      if (select) select.value = formattedName;
      renderAllViews();
    }, 100);
  } else {
    alert("This month already exists!");
  }
}

// Admin Action: Rename Current Month
function editCurrentMonthName(oldMonthName, newMonthName) {
  if (!newMonthName || !newMonthName.trim()) return;
  const formattedNew = newMonthName.trim();

  if (oldMonthName === formattedNew) return;
  if (localPortalData.payments[formattedNew]) {
    alert("A month with this name already exists!");
    return;
  }

  localPortalData.payments[formattedNew] = localPortalData.payments[oldMonthName] || {};
  delete localPortalData.payments[oldMonthName];

  saveData();

  setTimeout(() => {
    const select = document.getElementById("monthSelector");
    if (select) select.value = formattedNew;
    renderAllViews();
  }, 100);
}
