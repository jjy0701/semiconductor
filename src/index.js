// 대시보드 메인 스크립트 (Tailwind CSS 버전)

// 시스템 상태 불러오기
async function fetchSystemStatus() {
  const statusList = document.querySelector('.status-list');
  const lineStatusValue = document.getElementById('line-status-value');
  const anomalyValue = document.getElementById('anomaly-value');
  const updateTimeValue = document.getElementById('update-time-value');

  try {
    const res = await fetch('/api/system-status');
    const data = await res.json(); // { lineStatus, anomaly, updatedAt }

    // 상단 통계 카드 업데이트
    if (lineStatusValue) {
      lineStatusValue.textContent = data.lineStatus || '알 수 없음';
    }
    if (anomalyValue) {
      anomalyValue.textContent = data.anomaly || '알 수 없음';
      // 이상 감지 상태에 따라 색상 변경
      if (data.anomaly === '정상') {
        anomalyValue.className = 'stat-value text-status-normal';
      } else {
        anomalyValue.className = 'stat-value text-status-error';
      }
    }
    if (updateTimeValue) {
      const time = new Date(data.updatedAt).toLocaleTimeString('ko-KR', { hour12: false });
      updateTimeValue.textContent = time;
    }

    // 상세 정보 리스트 업데이트
    if (statusList) {
      statusList.innerHTML = `
        <li class="data-list-item">
          <span class="text-gray-400">생산 라인</span>
          <span class="font-semibold text-primary-400">${data.lineStatus}</span>
        </li>
        <li class="data-list-item">
          <span class="text-gray-400">이상 감지</span>
          <span class="badge ${data.anomaly === '정상' ? 'badge-success' : 'badge-error'}">${data.anomaly}</span>
        </li>
        <li class="data-list-item">
          <span class="text-gray-400">최근 업데이트</span>
          <span class="font-mono text-sm">${new Date(data.updatedAt).toLocaleString('ko-KR')}</span>
        </li>
      `;
    }
  } catch (e) {
    console.error('시스템 상태 로딩 실패:', e);
    
    if (lineStatusValue) lineStatusValue.textContent = '연결 실패';
    if (anomalyValue) {
      anomalyValue.textContent = '알 수 없음';
      anomalyValue.className = 'stat-value text-gray-500';
    }
    if (updateTimeValue) updateTimeValue.textContent = '--:--:--';
    
    if (statusList) {
      statusList.innerHTML = `
        <li class="data-list-item">
          <span class="alert alert-error text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            데이터 수신 실패 - 서버 연결을 확인해주세요
          </span>
        </li>
      `;
    }
  }
}

// AI 요약 불러오기
async function fetchAISummary() {
  const aiList = document.querySelector('.ai-list');
  const normalCount = document.getElementById('normal-count');
  const defectCount = document.getElementById('defect-count');
  const defectRate = document.getElementById('defect-rate');
  const defectRateBar = document.getElementById('defect-rate-bar');

  try {
    const res = await fetch('/api/ai-summary');
    const data = await res.json(); // { normalCount, defectCount }

    const total = data.normalCount + data.defectCount;
    const rate = total === 0 ? 0 : ((data.defectCount / total) * 100).toFixed(2);

    // 카운트 업데이트
    if (normalCount) {
      normalCount.textContent = `${data.normalCount}건`;
    }
    if (defectCount) {
      defectCount.textContent = `${data.defectCount}건`;
    }

    // 불량률 업데이트
    if (defectRate) {
      defectRate.textContent = `${rate}%`;
      // 불량률에 따라 색상 변경
      if (rate < 5) {
        defectRate.className = 'text-5xl font-bold text-status-normal';
      } else if (rate < 10) {
        defectRate.className = 'text-5xl font-bold text-status-warning';
      } else {
        defectRate.className = 'text-5xl font-bold text-status-error';
      }
    }
    if (defectRateBar) {
      defectRateBar.style.width = `${Math.min(rate, 100)}%`;
    }

    // 상세 정보 리스트
    if (aiList) {
      aiList.innerHTML = `
        <li class="data-list-item">
          <span class="text-gray-400">최근 1시간 판별</span>
          <div class="flex gap-2">
            <span class="badge-success">정상 ${data.normalCount}건</span>
            <span class="badge-error">불량 ${data.defectCount}건</span>
          </div>
        </li>
        <li class="data-list-item">
          <span class="text-gray-400">불량률</span>
          <span class="font-bold ${rate < 5 ? 'text-status-normal' : rate < 10 ? 'text-status-warning' : 'text-status-error'}">${rate}%</span>
        </li>
        <li class="data-list-item">
          <span class="text-gray-400">총 검사 수</span>
          <span class="font-semibold">${total}건</span>
        </li>
      `;
    }
  } catch (e) {
    console.error('AI 요약 로딩 실패:', e);
    
    if (normalCount) normalCount.textContent = '0건';
    if (defectCount) defectCount.textContent = '0건';
    if (defectRate) {
      defectRate.textContent = '--';
      defectRate.className = 'text-5xl font-bold text-gray-500';
    }
    if (defectRateBar) defectRateBar.style.width = '0%';
    
    if (aiList) {
      aiList.innerHTML = `
        <li class="data-list-item">
          <span class="alert alert-error text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            AI 요약 데이터 수신 실패
          </span>
        </li>
      `;
    }
  }
}

// 대시보드 초기화
function initDashboard() {
  console.log('대시보드 초기화 중...');
  
  // 초기 데이터 로드
  fetchSystemStatus();
  fetchAISummary();

  // 5초마다 자동 갱신
  setInterval(fetchSystemStatus, 5000);
  setInterval(fetchAISummary, 5000);
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initDashboard);
