const reader = document.getElementById("reader");
const scanStage = document.getElementById("scanStage");
const loading = document.getElementById("loading");
const resultBox = document.getElementById("result");
const statusText = document.getElementById("status");
const stats = document.getElementById("stats");
const openBtn = document.getElementById("openBtn");
const continueBtn = document.getElementById("continueBtn");
const cancelBtn = document.getElementById("cancelBtn");

let scannedURL = "";
const scanner = new Html5Qrcode("reader", { verbose: false });

const scannerConfig = {
  fps: 10,
  qrbox: Math.min(320, Math.floor(window.innerWidth * 0.7)),
  aspectRatio: 1.0,
  rememberLastUsedCamera: true,
};

function onScanSuccess(decodedText) {
  stopScanner();
  scannedURL = decodedText;
  showStage("loading");
  fetchScanResult(decodedText);
}

function showStage(stage) {
  scanStage.style.display = stage === "result" ? "none" : "block";
  loading.style.display = stage === "loading" ? "flex" : "none";
  resultBox.style.display = stage === "result" ? "block" : "none";

  if (stage === "loading") {
    loading.style.position = "absolute";
    loading.style.inset = "0";
    loading.style.pointerEvents = "auto";
    loading.style.background = "rgba(0, 0, 0, 0.78)";
  } else {
    loading.style.position = "absolute";
    loading.style.inset = "0";
    loading.style.pointerEvents = "none";
    loading.style.background = "rgba(0, 0, 0, 0.0)";
  }
}

function onScanFailure(errorMessage) {
}

async function fetchScanResult(decodedText) {
  try {
    const API_URL = "https://virus-scanner.goyfield-developers.workers.dev/";
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: decodedText }),
    });
    const data = await response.json();

    showStage("result");

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
    showStage("scan");
    alert("Server error.");
    console.error(e);
  }
}

function createStarfield() {
  const starfield = document.querySelector('.starfield');
  if (!starfield) return;
  const starCount = 90;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 2.5 + 1;
    star.className = 'star';
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.opacity = `${Math.random() * 0.65 + 0.2}`;
    star.style.filter = `blur(${Math.random() * 0.8}px)`;
    starfield.appendChild(star);
  }
}

async function startScanner() {
  try {
    const cameras = await Html5Qrcode.getCameras();
    let cameraConfig = { facingMode: { exact: "environment" } };

    if (cameras && cameras.length) {
      const backCamera = cameras.find(camera => /rear|back|environment/i.test(camera.label));
      if (backCamera) {
        cameraConfig = { deviceId: { exact: backCamera.id } };
      }
    }

    await scanner.start(cameraConfig, scannerConfig, onScanSuccess, onScanFailure);
  } catch (e) {
    const message = "카메라를 사용할 수 없습니다. 브라우저 권한을 허용하거나 HTTPS로 페이지를 열어주세요.";
    alert(message);
    console.error("Scanner start failed:", e);
  }
}

async function stopScanner() {
  try {
    await scanner.stop();
  } catch (e) {
    console.warn("Scanner stop warning:", e);
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

window.addEventListener("load", () => {
  createStarfield();
  showStage("scan");
  startScanner();
});
