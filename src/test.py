from ultralytics import YOLO
from pathlib import Path

current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent # src -> ai_intrusion


model_path = project_root / 'runs' / 'detect' / 'train12' / 'weights' / 'best.pt'
test_images_dir = project_root / 'dataset' / 'test' / 'images'
output_dir = project_root / 'runs' / 'detect' / 'predict'

print(f"로딩할 모델: {model_path}")
try:
    model = YOLO(model_path)
    print("모델 로딩 성공!")
except Exception as e:
    print(f"오류: 모델을 로드할 수 없습니다. 경로를 확인하세요: {e}")
    exit()

print(f"'{test_images_dir}' 폴더의 이미지로 예측을 시작합니다...")

results = model.predict(
    source=str(test_images_dir),
    save=True,
    conf=0.5,
    project=project_root / 'runs' / 'detect', # 저장될 상위 폴더
    name='predict'                          # 저장될 하위 폴더 이름
)

print("-" * 30)
print("예측 완료!")
print(f"결과가 '{output_dir}' 폴더에 저장되었습니다.")
print("폴더를 열어 박스가 잘 그려졌는지 확인해보세요!")