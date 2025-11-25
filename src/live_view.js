// 실시간 모니터링 스크립트 (Tailwind CSS 버전)

// HTML 요소 참조
const videoBox = document.getElementById('video-container');
const aiResultBox = document.getElementById('ai-result-container');
const timeEl = document.querySelector('.time-display-text');
const connectionIndicator = document.getElementById('connection-indicator');
const connectionStatus = document.getElementById('connection-status');
const defectTableBody = document.getElementById('defect-table-body');

// 통계 카운터
let normalCount = 0;
let defectCountNum = 0;
let stompClient = null;
let isDefaultMessageCleared = false;
const defectHistory = []; // 불량 이력 저장

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('실시간 모니터링 페이지 초기화');
  connectToWebSocket();
  startClientClock();
});

// 실시간 시계 기능
function startClientClock() {
  if (!timeEl) return;

  let baseTime = new Date();

  function update() {
    baseTime.setSeconds(baseTime.getSeconds() + 1);
    const timeStr = baseTime.toLocaleTimeString('ko-KR', { hour12: false });
    timeEl.textContent = `현재 시간: ${timeStr}`;
  }
  
  update();
  setInterval(update, 1000);
}

// 웹소켓 연결
function connectToWebSocket() {
  console.log('웹소켓 연결 시도...');
  updateConnectionStatus('connecting');

  try {
    // Spring Boot 서버의 웹소켓 엔드포인트
    const socket = new SockJS('http://localhost:8080/ws/live-feed');
    stompClient = Stomp.over(socket);

    // 연결 성공
    stompClient.connect({}, function (frame) {
      console.log('웹소켓 서버에 연결되었습니다:', frame);
      updateConnectionStatus('connected');

      // 비디오 박스 상태 업데이트
      if (videoBox) {
        videoBox.className = 'media-box-connected';
        videoBox.innerHTML = `
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-status-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-lg font-semibold">✅ 실시간 서버 연결됨</p>
            <p class="text-sm text-gray-400 mt-2">영상 스트림 대기 중...</p>
          </div>
        `;
      }

      // "/topic/live-feed" 채널 구독
      stompClient.subscribe('/topic/live-feed', function (message) {
        const data = JSON.parse(message.body);
        console.log('불량 정보 수신:', data);
        displayDefectLog(data);
      });

    }, function (error) {
      // 연결 실패
      console.error('웹소켓 연결 오류:', error);
      updateConnectionStatus('error');

      if (videoBox) {
        videoBox.className = 'media-box-error';
        videoBox.innerHTML = `
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-lg font-semibold">🚫 카메라 연결 오류</p>
            <p class="text-sm mt-2">Spring Boot 서버 응답 없음</p>
            <button onclick="reconnectWebSocket()" class="btn-primary mt-4">
              재연결 시도
            </button>
          </div>
        `;
      }

      // 3초 후 재연결 시도
      setTimeout(connectToWebSocket, 3000);
    });

  } catch (error) {
    console.error('웹소켓 초기화 오류:', error);
    updateConnectionStatus('error');
  }
}

// 연결 상태 업데이트
function updateConnectionStatus(status) {
  if (!connectionIndicator || !connectionStatus) return;

  switch (status) {
    case 'connecting':
      connectionIndicator.className = 'status-dot-warning';
      connectionStatus.textContent = '연결 중...';
      break;
    case 'connected':
      connectionIndicator.className = 'status-dot-success';
      connectionStatus.textContent = '연결됨';
      break;
    case 'error':
      connectionIndicator.className = 'status-dot-error';
      connectionStatus.textContent = '연결 실패';
      break;
    default:
      connectionIndicator.className = 'status-dot';
      connectionStatus.textContent = '알 수 없음';
  }
}

// 수신한 불량 데이터 표시
function displayDefectLog(data) {
  if (!aiResultBox) return;

  // 처음 메시지 받으면 기본 안내 메시지 제거
  if (!isDefaultMessageCleared) {
    aiResultBox.innerHTML = '';
    isDefaultMessageCleared = true;
  }

  // 데이터 추출
  const lineId = data.line_id || '알 수 없음';
  const defectType = data.defect_type || '알 수 없음';
  const confidence = ((data.confidence || 0) * 100).toFixed(0);
  const timestamp = new Date(data.timestamp).toLocaleString('ko-KR');
  const timeShort = new Date(data.timestamp).toLocaleTimeString('ko-KR');

  // 카운터 업데이트
  defectCountNum++;
  updateStatistics();

  // 불량 이력 저장
  defectHistory.unshift({
    time: timeShort,
    lineId,
    defectType,
    confidence,
    timestamp: data.timestamp
  });
  if (defectHistory.length > 20) defectHistory.pop();

  // AI 로그 박스에 새 항목 추가
  const newLogEntry = document.createElement('div');
  newLogEntry.className = 'ai-result-item-defect';
  newLogEntry.innerHTML = `
    <div class="flex items-start gap-3">
      <svg class="w-6 h-6 text-status-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-status-error">결함 감지!</span>
          <span class="text-xs text-gray-400">${timestamp}</span>
        </div>
        <div class="text-sm space-y-1 text-gray-300">
          <div>• 라인: <span class="font-semibold text-primary-400">${lineId}</span></div>
          <div>• 유형: <span class="font-semibold">${defectType}</span></div>
          <div>• 신뢰도: <span class="badge badge-error">${confidence}%</span></div>
        </div>
      </div>
    </div>
  `;

  // 최신 로그를 맨 위에 추가
  aiResultBox.prepend(newLogEntry);

  // 로그가 10개 이상이면 오래된 것 삭제
  if (aiResultBox.children.length > 10) {
    aiResultBox.removeChild(aiResultBox.lastChild);
  }

  // 테이블 업데이트
  updateDefectTable();
}

// 통계 업데이트
function updateStatistics() {
  const totalNormal = document.getElementById('total-normal');
  const totalDefect = document.getElementById('total-defect');
  const totalRate = document.getElementById('total-rate');

  if (totalNormal) totalNormal.textContent = normalCount;
  if (totalDefect) totalDefect.textContent = defectCountNum;

  const total = normalCount + defectCountNum;
  const rate = total === 0 ? 0 : ((defectCountNum / total) * 100).toFixed(1);
  
  if (totalRate) totalRate.textContent = `${rate}%`;
}

// 불량 테이블 업데이트
function updateDefectTable() {
  if (!defectTableBody) return;

  if (defectHistory.length === 0) {
    defectTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-gray-500 text-sm">
          아직 불량 감지 내역이 없습니다
        </td>
      </tr>
    `;
    return;
  }

  defectTableBody.innerHTML = defectHistory.map(item => `
    <tr class="hover:bg-dark-hover transition-colors">
      <td class="py-3 px-4 text-sm font-mono">${item.time}</td>
      <td class="py-3 px-4 text-sm">
        <span class="badge badge-info">${item.lineId}</span>
      </td>
      <td class="py-3 px-4 text-sm font-semibold">${item.defectType}</td>
      <td class="py-3 px-4 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-16 bg-dark-bg rounded-full h-2">
            <div class="bg-gradient-to-r from-status-error to-status-warning h-2 rounded-full" style="width: ${item.confidence}%"></div>
          </div>
          <span class="text-xs text-gray-400">${item.confidence}%</span>
        </div>
      </td>
      <td class="py-3 px-4 text-sm">
        <span class="badge-error">불량</span>
      </td>
    </tr>
  `).join('');
}

// 로그 지우기
function clearLogs() {
  if (aiResultBox) {
    aiResultBox.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-sm">로그가 지워졌습니다</p>
      </div>
    `;
    isDefaultMessageCleared = false;
  }
  
  // 통계는 유지하고 이력만 삭제
  defectHistory.length = 0;
  updateDefectTable();
}

// 재연결 함수 (전역으로 노출)
window.reconnectWebSocket = function() {
  console.log('수동 재연결 시도...');
  if (stompClient && stompClient.connected) {
    stompClient.disconnect();
  }
  connectToWebSocket();
};

window.clearLogs = clearLogs;
