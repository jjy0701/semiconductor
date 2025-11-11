/* /live_view.js (새로운 내용) */

// [1. HTML 요소 가져오기]
// (이 요소들은 live_view.html에 이미 존재합니다)
const videoBox = document.querySelector('.video-box');
const aiResultBox = document.querySelector('.ai-result-box');
const timeEl = document.querySelector('.time-display');

// [2. 페이지 초기화]
// 페이지가 로드되면 이 두 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
    connectToWebSocket(); // 실시간 웹소켓 연결 시작
    startClientClock();   // 실시간 (클라이언트 기준) 시계 시작
});


// [3. 실시간 시계 기능]
// (기존 코드의 syncServerTime/updateTimeDisplay를 클라이언트 기준으로 단순화)
function startClientClock() {
    if (!timeEl) return;

    let baseTime = new Date(); // 현재 클라이언트 시간으로 시작

    function update() {
        baseTime.setSeconds(baseTime.getSeconds() + 1);
        const timeStr = baseTime.toLocaleTimeString('ko-KR', { hour12: false });
        timeEl.textContent = `현재 시간: ${timeStr}`;
    }
    update();
    setInterval(update, 1000); // 1초마다 시간 업데이트
}


// [4. 웹소켓 연결 핵심 로직]
function connectToWebSocket() {
    // Spring Boot 서버의 웹소켓 엔드포인트
    const socket = new SockJS('http://localhost:8080/ws/live-feed');
    const stompClient = Stomp.over(socket); // STOMP 프로토콜 사용

    stompClient.connect({}, function (frame) {
        // ----- 연결 성공 시 -----
        console.log('웹소켓 서버에 연결되었습니다: ' + frame);
        // .video-box의 내용을 '연결 성공'으로 변경
        videoBox.innerHTML = "✅ 실시간 서버 연결됨. 영상 대기 중...";
        videoBox.style.color = "#333";
        videoBox.style.backgroundColor = '#e6ffe6'; // 초록색 배경

        // "/topic/live-feed" 채널을 구독하여 서버로부터 메시지 수신
        stompClient.subscribe('/topic/live-feed', function (message) {
            const data = JSON.parse(message.body); // JSON 데이터를 객체로 파싱
            console.log('불량 정보 수신: ', data);
            displayDefectLog(data); // 새 AI 결과 표시 함수 호출
        });

    }, function (error) {
        // ----- 연결 실패 시 -----
        console.error('웹소켓 연결 오류: ' + error);
        // .video-box의 내용을 '연결 실패'로 변경
        videoBox.innerHTML = "🚫 카메라 연결 오류 – Spring Boot 서버 응답 없음";
        videoBox.style.color = "#c9302c";
        videoBox.style.backgroundColor = '#ffdddd'; // 빨간색 배경
        // 3초 후 재연결 시도
        setTimeout(connectToWebSocket, 3000);
    });
}

// [5. 수신한 불량 데이터를 HTML에 표시하는 함수]

// 이 변수는 '.ai-result-box'의 기본 HTML을 한 번만 지우기 위해 사용
let isDefaultMessageCleared = false; 

function displayDefectLog(data) {
    if (!aiResultBox) return; // 표시할 영역이 없으면 종료

    // 처음 메시지를 받으면, 기본 "✔️ 인식된 코드..." 메시지를 지움
    if (!isDefaultMessageCleared) {
        aiResultBox.innerHTML = ''; 
        isDefaultMessageCleared = true;
    }

    // 데이터 추출
    const lineId = data.line_id || '알 수 없음';
    const defectType = data.defect_type || '알 수 없음';
    const confidence = (data.confidence * 100).toFixed(0);
    const timestamp = new Date(data.timestamp).toLocaleTimeString('ko-KR');

    // 새 로그 항목(div) 생성
    const newLogEntry = document.createElement('div');
    newLogEntry.style.color = "#c9302c"; // 불량은 빨간색으로
    newLogEntry.style.padding = "0.5rem";
    newLogEntry.style.borderBottom = "1px solid #eee";


    newLogEntry.innerHTML = `
        🚨 <strong>결함 감지!</strong> (${timestamp})<br>
        <span style="margin-left: 10px;">- 라인: ${lineId}</span><br>
        <span style="margin-left: 10px;">- 유형: ${defectType} (${confidence}%)</span>
    `;

    // 최신 로그를 맨 위에 추가
    aiResultBox.prepend(newLogEntry);

    // 로그가 10개 이상 쌓이면 가장 오래된 로그 삭제
    if (aiResultBox.children.length > 10) {
        aiResultBox.removeChild(aiResultBox.lastChild);
    }
}
