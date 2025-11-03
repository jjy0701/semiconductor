from pathlib import Path

# --- 설정 ---
# 현재 파일의 위치를 기준으로 프로젝트 최상위 폴더 경로를 찾습니다.
current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent # src -> ai_intrusion

# ✅ 스캔할 훈련 데이터 폴더 목록 (3-클래스 구조 및 증강 폴더 포함)
train_dirs = [
    project_root / 'dataset' / 'train' / 'Good',
    project_root / 'dataset' / 'train' / 'Good_augmented',
    project_root / 'dataset' / 'train' / 'Surface_Defect',
    project_root / 'dataset' / 'train' / 'Surface_Defect_augmented', # 👈 수정/추가
    project_root / 'dataset' / 'train' / 'Structural_Defect',
    project_root / 'dataset' / 'train' / 'Structural_Defect_augmented' # 👈 수정/추가
]

# 생성될 파일 리스트 경로 (프로젝트 최상위 폴더에 생성됩니다)
output_file = project_root / 'train.txt'

# --- 실행 ---
print("훈련 이미지 파일 목록 생성을 시작합니다...")

image_paths = []
# 각 폴더를 순회하며 이미지 파일 경로를 찾음
for dir_path in train_dirs:
    if dir_path.exists():
        # jpg, jpeg, png 확장자를 가진 모든 파일을 찾습니다.
        for image_file in list(dir_path.glob('*.jpg')) + list(dir_path.glob('*.jpeg')) + list(dir_path.glob('*.png')):
            image_paths.append(str(image_file))
    else:
        print(f"경고: '{dir_path}' 폴더를 찾을 수 없습니다.")

# 찾은 경로들을 텍스트 파일에 저장
with open(output_file, 'w') as f:
    for path in image_paths:
        f.write(f"{path}\n")

print("-" * 30)
print(f"총 {len(image_paths)}개의 이미지 경로를 '{output_file}' 파일에 저장했습니다.")