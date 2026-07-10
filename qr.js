const reader = document.getElementById("reader");
const loading = document.getElementById("loading");
const resultBox = document.getElementById("result");
const statusText = document.getElementById("status");
const stats = document.getElementById("stats");
const openBtn = document.getElementById("openBtn");
const continueBtn = document.getElementById("continueBtn");
const cancelBtn = document.getElementById("cancelBtn");

let scannedURL = "";
const scanner = new Html5Qrcode("reader");

scanner.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 320 },
  onScanSuccess
);

async function onScanSuccess(decodedText) {
  try {
    await scanner.stop();
  } catch (e) {
    console.warn("Scanner stop warning:", e);
  }

  scannedURL = decodedText;
  document.getElementById("scanStage").classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    const API_URL = "https://virus-scanner.goyfield-developers.workers.dev/";
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: decodedText }),
    });
    const data = await response.json();

    loading.classList.add("hidden");
    resultBox.classList.remove("hidden");

    stats.innerHTML = `
      <div class="stat-row"><span>악성코드</span><span class="stat-value">${data.malicious}</span></div>
      <div class="stat-row"><span>의심코드</span><span class="stat-value">${data.suspicious}</span></div>
      <div class="stat-row"><span>안전</span><span class="stat-value">${data.harmless}</span></div>
    `;

    if (data.safe) {
      statusText.textContent = "안전";
      statusText.className = "safe";
      openBtn.style.display = "inline-block";
      continueBtn.style.display = "none";
    } else {
      statusText.textContent = "경고";
      statusText.className = "warning";
      openBtn.style.display = "none";
      continueBtn.style.display = "inline-block";
    }
  } catch (e) {
    loading.classList.add("hidden");
    alert("Server error.");
    console.error(e);
  }
}

openBtn.onclick = () => {
  window.location.href = scannedURL;
};
continueBtn.onclick = () => {
  window.location.href = scannedURL;
};
cancelBtn.onclick = () => {
  location.reload();
};