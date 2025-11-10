// 실시간 영상 연결 상태 확인 (연결 여부만 표시)
async function checkCameraConnection() {
  const videoBox = document.querySelector('.video-box');

  try {
    
    const res = await fetch('/api/camera-status');
    const data = await res.json();

    if (!data.connected) {
      videoBox.textContent = '🚫 실시간 영상 연결 실패 – 장비 상태 확인';
      videoBox.style.backgroundColor = '#ffdddd';
    }
  } catch (e) {
    videoBox.textContent = '🚫 카메라 연결 오류 – 서버 응답 없음';
  }
}

// 현재 시간 표시 (서버 시간 기준)
async function syncServerTime() {
  const timeEl = document.querySelector('.time-display');

  try {
    const res = await fetch('/api/server-time');
    const data = await res.json(); // { time: "2025-11-03T14:22:00Z" }
    const serverTime = new Date(data.time);
    updateTimeDisplay(serverTime);
  } catch (e) {
    // fallback: 클라이언트 시간
    updateTimeDisplay(new Date());
  }
}

function updateTimeDisplay(baseTime) {
  const timeEl = document.querySelector('.time-display');

  function update() {
    baseTime.setSeconds(baseTime.getSeconds() + 1);
    const timeStr = baseTime.toLocaleTimeString('ko-KR', { hour12: false });
    timeEl.textContent = `현재 시간: ${timeStr}`;
  }

  update();
  setInterval(update, 1000);
}

// AI 판별 결과 수신
async function fetchAIResult() {
  const resultBox = document.querySelector('.ai-result-box');

  try {
    const res = await fetch('/api/ai-result');
    const data = await res.json(); // { code, result, timestamp }

    resultBox.innerHTML = `
      <div class="ai-result-item">✔️ 인식된 코드: <strong>${data.code}</strong></div>
      <div class="ai-result-item">📌 결과: <strong>${data.result}</strong></div>
      <div class="ai-result-item">🕒 판별 시각: ${new Date(data.timestamp).toLocaleString('ko-KR')}</div>
    `;
  } catch (e) {
    resultBox.innerHTML = `<div class="ai-result-item">❌ 판별 결과 수신 실패</div>`;
  }
}

function initLiveViewPage() {
  checkCameraConnection();
  syncServerTime();
  fetchAIResult();

  setInterval(fetchAIResult, 5000);
}

document.addEventListener('DOMContentLoaded', initLiveViewPage);
