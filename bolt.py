import cv2
from ultralytics import YOLO
import requests
import time
import threading  # 1. 스레딩 라이브러리 import
from flask import Flask, Response  # 2. Flask import (render_template은 사용 안 함)

# --- [설정] ---
MODEL_PATH = 'best.pt' # YOLO 모델 경로 (스크립트와 같은 폴더에 있다고 가정)
REPORT_API_URL = "http://localhost:8080/api/v1/analysis/live-report"
LINE_ID = "Line_A"
POST_INTERVAL = 1.0       # 1초에 한 번만 전송
CONFIDENCE_THRESHOLD = 0.9  # 90% 신뢰도 이상일 때만 전송

# 3. Flask 앱 생성
app = Flask(__name__)

# 4. 전역 변수: 현재 프레임을 저장할 변수
output_frame = None
frame_lock = threading.Lock()
# --- [설정 끝] ---


# 5. YOLO 탐지 및 Spring Boot 연동을 위한 함수 (별도 스레드에서 실행)
def run_yolo_detection():
    global output_frame, frame_lock, model
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("오류: 카메라를 열 수 없습니다.")
        return # 스레드 종료
        
    print("실시간 탐지를 시작합니다...")
    last_post_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("오류: 프레임을 읽을 수 없습니다.")
            break

        # --- AI 모델 추론 ---
        results = model(frame, stream=True, verbose=False) 
        is_actual_defect_found = False

        # --- AI 결과 파싱 및 시각화 ---
        for r in results:
            boxes = r.boxes 
            for box in boxes:
                # (1) 정보 추출
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = round(float(box.conf[0]), 2)
                cls_id = int(box.cls[0])
                defect_type = model.names[cls_id]

                # (2) 'Good' 클래스는 건너뛰기
                if defect_type == 'Good':
                    continue 

                # (3) 'Good'이 아닐 때 (즉, 'Crack', 'Dent' 등일 때)
                is_actual_defect_found = True 
                
                # (4) 화면에 그리기
                color = (0, 0, 255) # 불량은 빨간색
                
                # --- ▼▼▼ [수정] 박스 크기 조절 (Padding) ▼▼▼ ---
                padding = 10 # 10픽셀만큼 안쪽으로 줄임 (이 값을 조절하세요)
                
                draw_x1 = x1 + padding
                draw_y1 = y1 + padding
                draw_x2 = x2 - padding
                draw_y2 = y2 - padding

                # 패딩이 너무 커서 박스가 사라지는 것 방지
                if draw_x1 >= draw_x2 or draw_y1 >= draw_y2:
                    draw_x1, draw_y1, draw_x2, draw_y2 = x1, y1, x2, y2 # 원본 좌표 사용
                
                # 사각형 그리기 (수정됨: draw_ 좌표 사용)
                cv2.rectangle(frame, (draw_x1, draw_y1), (draw_x2, draw_y2), color, 2)
                
                # 텍스트 쓰기 (수정됨: draw_ 좌표 사용)
                text = f"{defect_type} ({confidence*100:.0f}%)"
                cv2.putText(frame, text, (draw_x1, draw_y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                # --- ▲▲▲ [수정] ---

                # --- 6. [수정된 부분] 데이터 전송 로직 ---
                current_time = time.time()
                if (current_time - last_post_time > POST_INTERVAL) and (confidence > CONFIDENCE_THRESHOLD):
                    try:
                        payload = {
                            "lineId": LINE_ID,
                            "defectType": defect_type,
                            "confidence": confidence
                        }
                        # Spring Boot 서버로 POST 요청
                        response = requests.post(REPORT_API_URL, json=payload, timeout=1)
                        
                        if response.status_code == 200:
                            print(f"[{LINE_ID}] 불량 정보 전송 성공: {defect_type}")
                        else:
                            print(f"서버 응답 에러: {response.status_code}")
                        
                        last_post_time = current_time # 전송 시간 기록

                    except requests.exceptions.RequestException as e:
                        print(f"서버 연결 실패: {e}")
                # --- [수정된 부분 끝] ---

        # --- "Good" 상태 표시 ---
        if not is_actual_defect_found:
            color = (0, 255, 0) # 정상은 초록색
            text = "Good (100%)"
            cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        # 6. 프레임을 전역 변수에 저장 (스트리밍용)
        with frame_lock:
            output_frame = frame.copy()
            
        # (cv2.imshow는 이제 사용하지 않으므로 주석 처리)
        # cv2.imshow("Live Defect Detection", frame) 
        
        # (터미널에서 Ctrl+C로 종료하는 것을 권장)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


# 7. Flask가 웹페이지에 영상을 스트리밍하는 함수
def generate_frames():
    global output_frame, frame_lock
    
    while True:
        time.sleep(0.03) # 약 30fps
        with frame_lock:
            # output_frame이 아직 없으면 대기
            if output_frame is None:
                continue
            
            # 프레임을 JPEG 이미지로 인코딩
            (flag, encoded_image) = cv2.imencode(".jpg", output_frame)
            
            if not flag:
                continue

        # M-JPEG 스트림 형식으로 yield
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
              bytearray(encoded_image) + b'\r\n')


# 8. Flask의 라우트(주소) 설정
@app.route("/video_feed")
def video_feed():
    # generate_frames 함수가 반환하는 스트림을 웹페이지로 전송
    return Response(generate_frames(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

# --- [메인 실행 부분] ---
if __name__ == '__main__':
    # 1. 훈련된 YOLOv8 모델 로드
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"오류: 모델 로드를 실패했습니다. '{MODEL_PATH}' 파일이 있는지 확인하세요.")
        print(e)
        exit()
    
    # 2. YOLO 탐지 스레드 시작
    yolo_thread = threading.Thread(target=run_yolo_detection)
    yolo_thread.daemon = True # 메인 프로그램 종료 시 스레드도 종료
    yolo_thread.start()
    
    # 3. Flask 웹 서버 실행 (영상 스트리밍 서버)
    print("영상 스트리밍 서버를 http://localhost:5001/video_feed 에서 시작합니다.")
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)