from ultralytics import YOLO


model = YOLO('yolov8n.pt')


if __name__ == '__main__':
    results = model.train(
        data='data.yaml',  # data.yaml 파일 경로
        epochs=100,           # 전체 데이터셋을 100번 반복 학습
        imgsz=640,            # 학습에 사용할 이미지 크기
        patience=30,          # 30번 연속으로 성능 향상이 없으면 조기 종료
        batch=16             # 한 번에 몇 장의 이미지를 학습할지 결
    )
        