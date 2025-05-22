let startTime1, startTime2;
let timerInterval1, timerInterval2;
let count = 1;
let allDurations = [];
let withBiometric = [];
let withoutBiometric = [];

function getHijriDate() {
  const today = new Date();
  const hijri = HijriJS.toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const y = hijri.hy;
  const m = hijri.hm.toString().padStart(2, '0');
  const d = hijri.hd.toString().padStart(2, '0');
  return `${y}/${m}/${d}`;
}

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

  if (id === 1) clearInterval(timerInterval1);
  else clearInterval(timerInterval2);

  const now = new Date();
  const duration = Math.floor((now - (id === 1 ? startTime1 : startTime2)) / 1000);
  const fingerprint = document.querySelector(`input[name="fingerprint${id}"]:checked`).value;
  const delayReason = document.getElementById(`delayReason${id}`).value;

  allDurations.push(duration);
  if (fingerprint === "نعم") withBiometric.push(duration);
  else withoutBiometric.push(duration);

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const hijriDate = getHijriDate();

  const table = document.getElementById("logTable").querySelector("tbody");
  const newRow = table.insertRow();
  newRow.innerHTML = `
    <td>${count++}</td>
    <td>${hijriDate}</td>
    <td>${time}</td>
    <td>${duration}</td>
    <td>${fingerprint}</td>
    <td>${delayReason}</td>
  `;

  document.getElementById(`timer${id}`).textContent = "00:00";
  document.getElementById(`delayReason${id}`).value = "";
  if (id === 1) startTime1 = null;
  else startTime2 = null;

  saveTableData();
  updateUnifiedAverage();
  updatePercentRow();
  updateMinMaxRow();
}

function updateUnifiedAverage() {
  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : 0;
  const avgAll = avg(allDurations);
  const avgWith = avg(withBiometric);
  const avgWithout = avg(withoutBiometric);

  document.getElementById("unifiedAverageRow").textContent =
    `متوسط الزمن العام: ${avgAll} ثانية — له بصمة: ${avgWith} ثانية — ماله بصمة: ${avgWithout} ثانية`;
}

function updatePercentRow() {
  const yes = withBiometric.length;
  const no = withoutBiometric.length;
  const total = yes + no;
  const percent = v => total ? Math.round((v / total) * 100) : 0;
  document.getElementById("percentRow").textContent =
    `نسبة المسجل لهم بصمة: ${percent(yes)}% — نسبة غير المسجل لهم: ${percent(no)}%`;
}

function updateMinMaxRow() {
  const min = arr => arr.length ? Math.min(...arr) : 0;
  const max = arr => arr.length ? Math.max(...arr) : 0;
  const minWith = min(withBiometric);
  const maxWith = max(withBiometric);
  const minWithout = min(withoutBiometric);
  const maxWithout = max(withoutBiometric);
  document.getElementById("minMaxRow").textContent =
    `الأزمنة القصوى والدنيا — بالبصمة: أقل ${minWith}ث، أعلى ${maxWith}ث — بدون بصمة: أقل ${minWithout}ث، أعلى ${maxWithout}ث`;
}

function saveTableData() {
  const tbody = document.querySelector("#logTable tbody");
  localStorage.setItem("hajjTableRows", tbody.innerHTML);
}

function clearData() {
  localStorage.removeItem("hajjTableRows");
  const tbody = document.querySelector("#logTable tbody");
  tbody.innerHTML = "";
  count = 1;
  allDurations = [];
  withBiometric = [];
  withoutBiometric = [];
  document.getElementById("timer1").textContent = "00:00";
  document.getElementById("timer2").textContent = "00:00";
  updateUnifiedAverage();
  updatePercentRow();
  updateMinMaxRow();
}

function undoLastEntry() {
  const table = document.querySelector("#logTable tbody");
  const lastRow = table.lastElementChild;
  if (!lastRow) return;

  const duration = parseInt(lastRow.cells[3]?.textContent.trim());
  const biometric = lastRow.cells[4]?.textContent.trim();

  if (!isNaN(duration)) {
    allDurations.pop();
    if (biometric === "نعم") withBiometric.pop();
    else if (biometric === "لا") withoutBiometric.pop();
  }

  table.removeChild(lastRow);
  count = Math.max(1, count - 1);
  saveTableData();
  updateUnifiedAverage();
  updatePercentRow();
  updateMinMaxRow();
}

function saveTableAsExcel() {
  let table = document.getElementById("logTable");
  let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, "سجل_الحجاج.xlsx", { bookType: "xlsx", type: "binary", charset: "utf-8" });
}

document.addEventListener("DOMContentLoaded", function () {
  const savedRows = localStorage.getItem("hajjTableRows");
  if (savedRows) {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = savedRows;
    count = tbody.rows.length + 1;

    allDurations = [];
    withBiometric = [];
    withoutBiometric = [];

    tbody.querySelectorAll("tr").forEach(row => {
      const duration = parseInt(row.cells[3]?.textContent.trim());
      const biometric = row.cells[4]?.textContent.trim();
      if (!isNaN(duration)) {
        allDurations.push(duration);
        if (biometric === "نعم") withBiometric.push(duration);
        else if (biometric === "لا") withoutBiometric.push(duration);
      }
    });

    updateUnifiedAverage();
    updatePercentRow();
    updateMinMaxRow();
  }
});
