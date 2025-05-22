let startTime1, startTime2;
let timerInterval1, timerInterval2;
let count = 1;
let allDurations = [], withBiometric = [], withoutBiometric = [];

function startTimer(id) {
  const now = new Date();
  if (id === 1) {
    startTime1 = now;
    clearInterval(timerInterval1);
    timerInterval1 = setInterval(() => {
      const seconds = Math.floor((new Date() - startTime1) / 1000);
      document.getElementById("timer1").textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
  } else {
    startTime2 = now;
    clearInterval(timerInterval2);
    timerInterval2 = setInterval(() => {
      const seconds = Math.floor((new Date() - startTime2) / 1000);
      document.getElementById("timer2").textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
  }
}

function stopTimer(id) {
  if ((id === 1 && !startTime1) || (id === 2 && !startTime2)) {
    alert("يجب الضغط على زر البدء أولاً.");
    return;
  }

  const now = new Date();
  const duration = Math.floor((now - (id === 1 ? startTime1 : startTime2)) / 1000);
  const fingerprint = document.querySelector(`input[name="fingerprint${id}"]:checked`).value;
  const delayReason = document.getElementById(`delayReason${id}`).value;
  const date = now.toLocaleDateString('en-GB');
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  allDurations.push(duration);
  if (fingerprint === "نعم") withBiometric.push(duration);
  else withoutBiometric.push(duration);

  const row = document.getElementById("logTable").querySelector("tbody").insertRow();
  row.innerHTML = `<td>${count++}</td><td>${date}</td><td>${time}</td><td>${duration}</td><td>${fingerprint}</td><td>${delayReason}</td>`;

  document.getElementById(`timer${id}`).textContent = "00:00";
  document.getElementById(`delayReason${id}`).value = "";
  if (id === 1) startTime1 = null; else startTime2 = null;

  saveTableData();
  updateStats();
}

function updateStats() {
  const avg = arr => arr.length ? Math.round(arr.reduce((a,b) => a + b) / arr.length) : 0;
  const min = arr => arr.length ? Math.min(...arr) : 0;
  const max = arr => arr.length ? Math.max(...arr) : 0;
  const total = withBiometric.length + withoutBiometric.length;
  const percent = v => total ? Math.round((v / total) * 100) : 0;

  const html = `
    <div>الإجمالي: ${total} — له بصمة: ${withBiometric.length} (${percent(withBiometric.length)}%) — لا يوجد بصمة: ${withoutBiometric.length} (${percent(withoutBiometric.length)}%)</div>
    <div>المتوسط (ثانية): الكل ${avg(allDurations)} — بالبصمة ${avg(withBiometric)} — بدون بصمة ${avg(withoutBiometric)}</div>
    <div>أقل/أعلى (بالبصمة): ${min(withBiometric)} / ${max(withBiometric)} — (بدون): ${min(withoutBiometric)} / ${max(withoutBiometric)}</div>
  `;
  document.getElementById("customStats").innerHTML = html;
}

function saveTableAsExcel() {
  const table = document.querySelector("#logTable");
  let csv = "";
  table.querySelectorAll("tr").forEach(row => {
    const cols = row.querySelectorAll("th, td");
    csv += Array.from(cols).map(col => `"${col.textContent.trim()}"`).join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "سجل_الحجاج.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function saveTableData() {
  const tbody = document.querySelector("#logTable tbody");
  localStorage.setItem("hajjTableRows", tbody.innerHTML);
}

function clearData() {
  localStorage.removeItem("hajjTableRows");
  document.querySelector("#logTable tbody").innerHTML = "";
  allDurations = [];
  withBiometric = [];
  withoutBiometric = [];
  count = 1;
  updateStats();
}

function undoLastEntry() {
  const tbody = document.querySelector("#logTable tbody");
  const lastRow = tbody.lastElementChild;
  if (!lastRow) return;
  const duration = parseInt(lastRow.cells[3].textContent.trim());
  const biometric = lastRow.cells[4].textContent.trim();
  allDurations.pop();
  if (biometric === "نعم") withBiometric.pop(); else withoutBiometric.pop();
  tbody.removeChild(lastRow);
  count--;
  saveTableData();
  updateStats();
}

function deleteRowByNumber() {
  const rowNum = parseInt(document.getElementById("rowToDelete").value);
  if (!rowNum) return alert("أدخل رقم صف صحيح");
  const rows = document.querySelectorAll("#logTable tbody tr");
  const row = Array.from(rows).find(r => parseInt(r.cells[0].textContent) === rowNum);
  if (!row) return alert("لم يتم العثور على الصف");
  if (!confirm("هل أنت متأكد من حذف الصف؟")) return;
  const duration = parseInt(row.cells[3].textContent.trim());
  const biometric = row.cells[4].textContent.trim();
  allDurations = allDurations.filter(d => d !== duration);
  if (biometric === "نعم") withBiometric = withBiometric.filter(d => d !== duration);
  else withoutBiometric = withoutBiometric.filter(d => d !== duration);
  row.remove();
  saveTableData();
  updateStats();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedRows = localStorage.getItem("hajjTableRows");
  if (savedRows) {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = savedRows;
    count = tbody.rows.length + 1;
    tbody.querySelectorAll("tr").forEach(row => {
      const duration = parseInt(row.cells[3].textContent.trim());
      const biometric = row.cells[4].textContent.trim();
      if (!isNaN(duration)) {
        allDurations.push(duration);
        if (biometric === "نعم") withBiometric.push(duration);
        else withoutBiometric.push(duration);
      }
    });
    updateStats();
  }
});
