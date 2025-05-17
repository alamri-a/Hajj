let startTime = null;

document.getElementById('datetimeBtn').addEventListener('click', () => {
  const now = new Date();
  const datetime = now.toLocaleDateString('ar-EG') + ' - ' + now.toLocaleTimeString('ar-EG');
  document.getElementById('datetimeDisplay').innerText = datetime;
});

document.getElementById('startBtn').addEventListener('click', () => {
  startTime = new Date();
  alert('تم تسجيل وقت البدء');
});

document.getElementById('endBtn').addEventListener('click', () => {
  if (!startTime) {
    alert('يرجى الضغط على "بدء" أولاً');
    return;
  }

  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  const date = startTime.toLocaleDateString('ar-EG');
  const start = startTime.toLocaleTimeString('ar-EG');
  const end = endTime.toLocaleTimeString('ar-EG');
  const fingerprint = document.getElementById('fingerprint').value;
  const delayReason = document.getElementById('delayReason').value;

  const table = document.getElementById('dataTable');
  const row = table.insertRow();
  row.insertCell(0).innerText = date;
  row.insertCell(1).innerText = start;
  row.insertCell(2).innerText = end;
  row.insertCell(3).innerText = duration;
  row.insertCell(4).innerText = fingerprint;
  row.insertCell(5).innerText = delayReason;

  startTime = null;
});

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('delayReason').value = "";
  document.getElementById('fingerprint').value = "نعم";
  startTime = null;
  alert('تم التهيئة لتسجيل جديد');
});
