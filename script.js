let units = JSON.parse(localStorage.getItem('units')) || [];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Add unit
function addUnit() {
  const unit = {
    property: document.getElementById("propertyName").value.trim(),
    unitNumber: document.getElementById("unitNumber").value.trim(),
    type: document.getElementById("unitType").value.trim(),
    tenant: document.getElementById("tenantName").value.trim(),
    contact: document.getElementById("tenantContact").value.trim(),
    monthlyRent: parseFloat(document.getElementById("monthlyRent").value) || 0,
    status: document.getElementById("rentStatus").value,
    payments: Array(12).fill(0)
  };

  if (!unit.property || !unit.unitNumber) {
    alert("Property name and Unit number are required.");
    return;
  }

  units.push(unit);
  saveUnits();
  clearInputs();
  renderTable();
}

// Clear inputs
function clearInputs() {
  document.getElementById("propertyName").value = "";
  document.getElementById("unitNumber").value = "";
  document.getElementById("unitType").value = "";
  document.getElementById("tenantName").value = "";
  document.getElementById("tenantContact").value = "";
  document.getElementById("monthlyRent").value = "";
  document.getElementById("rentStatus").value = "Vacant";
}

// Save to localStorage
function saveUnits() {
  localStorage.setItem('units', JSON.stringify(units));
}

// Delete unit
function deleteUnit(index) {
  units.splice(index, 1);
  saveUnits();
  renderTable();
}

// Update field or payment
function updateCell(unitIndex, field, monthIndex, value) {
  if (monthIndex !== null && monthIndex !== undefined) {
    units[unitIndex].payments[monthIndex] = parseFloat(value) || 0;
  } else {
    if (field === "monthlyRent") value = parseFloat(value) || 0;
    units[unitIndex][field] = value;
  }
  saveUnits();
  renderTable();
}

// Render table
function renderTable() {
  const table = document.getElementById("unitTable");
  table.innerHTML = "";
  let totalCollected = 0;
  let vacantCount = 0;

  const filterProperty = document.getElementById("filterProperty").value.toLowerCase();
  const filterType = document.getElementById("filterType").value.toLowerCase();
  const filterStatus = document.getElementById("filterStatus").value;

  units.forEach(function(unit, index) {
    if (
      unit.property.toLowerCase().includes(filterProperty) &&
      unit.type.toLowerCase().includes(filterType) &&
      (filterStatus === "" || unit.status === filterStatus)
    ) {
      const row = table.insertRow();

      const fields = ["property","unitNumber","type","tenant","contact","status","monthlyRent"];
      fields.forEach(function(field, i) {
        const cell = row.insertCell(i);
        const input = document.createElement("input");
        input.value = unit[field];
        input.style.width = (field === "monthlyRent") ? "80px" : "120px";
        input.onchange = function(e) {
          updateCell(index, field, null, e.target.value);
        };
        cell.appendChild(input);
      });

      // Payments
      const paymentsCell = row.insertCell(7);
      months.forEach(function(month, mIndex) {
        const input = document.createElement("input");
        input.type = "number";
        input.value = unit.payments[mIndex];
        input.className = "payment-input";
        input.onchange = function(e) {
          updateCell(index, "payments", mIndex, e.target.value);
        };
        paymentsCell.appendChild(document.createTextNode(month + ": "));
        paymentsCell.appendChild(input);
        paymentsCell.appendChild(document.createElement("br"));
      });

      // Balance
      const totalPaid = unit.payments.reduce(function(a, b) { return a + b; }, 0);
      totalCollected += totalPaid;
      const balance = unit.monthlyRent * 12 - totalPaid;
      const balanceCell = row.insertCell(8);
      balanceCell.textContent = "UGX " + balance.toLocaleString();

      if (balance === 0) balanceCell.className = "occupied";
      else if (balance < unit.monthlyRent * 12) balanceCell.className = "partial";
      else balanceCell.className = "vacant";

      if (unit.status === "Vacant") vacantCount++;

      // Delete button
      const actionCell = row.insertCell(9);
      actionCell.innerHTML = '<button onclick="deleteUnit(' + index + ')">Delete</button>';
    }
  });

  document.getElementById("totals").textContent =
    "Total collected this year: UGX " + totalCollected.toLocaleString() + " | Vacant units: " + vacantCount;
}

// Initial render
renderTable();