// 시스템 상태 불러오기
async function fetchSystemStatus() {
  const statusList = document.querySelector('.status-list');

  try {
    const res = await fetch('/api/system-status');
    const data = await res.json(); // { lineStatus, anomaly, updatedAt }

    statusList.innerHTML = `
      <li>생산 라인: <strong>${data.lineStatus}</strong></li>
      <li>이상 감지: <strong>${data.anomaly}</strong></li>
      <li>최근 업데이트: ${new Date(data.updatedAt).toLocaleString('ko-KR')}</li>
    `;
  } catch (e) {
    statusList.innerHTML = `
      <li>생산 라인: <strong>데이터 수신 실패</strong></li>
      <li>이상 감지: <strong>알 수 없음</strong></li>
      <li>최근 업데이트: -</li>
    `;
  }
}

// AI 요약 불러오기
async function fetchAISummary() {
  const aiList = document.querySelector('.ai-list');

  try {
    const res = await fetch('/api/ai-summary');
    const data = await res.json(); // { normalCount, defectCount }

    const total = data.normalCount + data.defectCount;
    const rate = total === 0 ? 0 : ((data.defectCount / total) * 100).toFixed(2);

    aiList.innerHTML = `
      <li>최근 1시간: <strong>정상 ${data.normalCount}건</strong>, <strong>불량 ${data.defectCount}건</strong></li>
      <li>불량률: <strong>${rate}%</strong></li>
    `;
  } catch (e) {
    aiList.innerHTML = `
      <li>최근 1시간: <strong>판별 없음</strong></li>
      <li>불량률: <strong>-</strong></li>
    `;
  }
}

function initDashboard() {
  fetchSystemStatus();
  fetchAISummary();

  setInterval(fetchSystemStatus, 5000);
  setInterval(fetchAISummary, 5000);
}

document.addEventListener('DOMContentLoaded', initDashboard);
