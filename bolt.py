import cv2
from ultralytics import YOLO

# 1.  훈련된 YOLOv8 모델 로드
try:
    model = YOLO('모델 파일 경로') 
except Exception as e:
    print(f"오류: 모델 로드를 실패했습니다. 'best.pt' 파일이 있는지 확인하세요.")
    print(e)
    exit()

# (선택 사항) 모델의 클래스 이름 가져오기 (예: ['Good', 'Crack', 'Dent'])
# class_names = model.names
# print("모델 클래스:", class_names)

# 0번 카메라 (웹캠) 열기
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("오류: 카메라를 열 수 없습니다.")
    exit()

print("실시간 탐지를 시작합니다... (종료: q)")

while True:
    ret, frame = cap.read()
    if not ret:
        print("오류: 프레임을 읽을 수 없습니다.")
        break

    # --- 2. AI 모델 추론 (Inference) ---
    #    'frame'을 AI 모델에 입력하여 결과를 받습니다.
    #    stream=True는 실시간 처리에 더 효율적입니다.
    results = model(frame, stream=True, verbose=False) # verbose=False로 로그 출력 끔

    is_defect_detected = False # 이번 프레임에 불량 감지 여부

    # --- 3. AI 모델 결과 파싱 및 시각화 ---
    for r in results:
        boxes = r.boxes # 감지된 객체들의 바운딩 박스 정보
        
        for box in boxes:
            is_defect_detected = True # 무언가 감지됨

            # (1) 바운딩 박스 좌표
            x1, y1, x2, y2 = box.xyxy[0] # [x_min, y_min, x_max, y_max]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2) # 정수로 변환
            
            # (2) 신뢰도 (Confidence)
            confidence = round(float(box.conf[0]), 2)
            
            # (3) 클래스 ID 및 이름
            cls_id = int(box.cls[0])
            defect_type = model.names[cls_id] # 모델에 저장된 클래스 이름 (예: 'Crack')

            # (4) 화면에 그리기
            color = (0, 0, 255) # 불량은 빨간색
            
            # 사각형 그리기
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # 텍스트 쓰기
            text = f"{defect_type} ({confidence*100:.0f}%)"
            cv2.putText(frame, text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    # --- 4. "Good" 상태 표시 ---
    # 만약 위 for 루프에서 아무것도 감지되지 않았다면 (is_defect_detected == False)
    if not is_defect_detected:
        color = (0, 255, 0) # 정상은 초록색
        text = "Good (100%)"
        cv2.putText(frame, text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)


    # 5. 결과 화면 표시
    cv2.imshow("Live Defect Detection", frame)

    # 'q' 키를 누르면 루프 종료
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
