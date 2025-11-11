import os
import shutil
from pathlib import Path

# --- 설정 ---
# 현재 파일의 위치를 기준으로 프로젝트 최상위 폴더 경로를 찾습니다.
current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent # src -> ai_intrusion

# 원본 데이터셋 경로
base_dir = project_root / 'dataset'

# ✅ 클래스 이름과 번호 정의 (3-클래스 버전)
class_map = {
    'Good': 0,
    'Surface_Defect': 1,    # 표면 결함 (녹 + 스크래치)
    'Structural_Defect': 2  # 구조 결함 (부러짐 + 휨)
}

print("데이터셋 재구성 및 라벨 파일 생성을 시작합니다...")

# train과 test 데이터셋에 대해 반복 처리
for split in ['train', 'test']:
    source_split_dir = base_dir / split
    
    # 새로운 images와 labels 폴더 경로
    images_dir = source_split_dir / 'images'
    labels_dir = source_split_dir / 'labels'
    
    # 이전에 만들었던 폴더가 있다면 삭제하고 새로 시작
    if images_dir.exists(): shutil.rmtree(images_dir)
    if labels_dir.exists(): shutil.rmtree(labels_dir)
    
    # 새로운 폴더 생성
    images_dir.mkdir(parents=True)
    labels_dir.mkdir(parents=True)
    
    print(f"'{split}' 데이터셋 처리 중...")

    # Good, Surface_Defect, Structural_Defect 폴더를 순회
    for class_name, class_id in class_map.items():
        class_dir = source_split_dir / class_name
        
        if not class_dir.exists():
            print(f"경고: '{class_dir}' 폴더가 없어 건너뜁니다.")
            continue
            
        # 폴더 내의 모든 이미지 파일을 찾음
        image_files = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.jpeg')) + list(class_dir.glob('*.png'))
        
        for img_path in image_files:
            # 1. 이미지를 새로운 images 폴더로 복사
            shutil.copy(img_path, images_dir / img_path.name)
            
            # 2. 라벨 파일 생성
            label_path = labels_dir / f"{img_path.stem}.txt"
            
            # 라벨 파일 내용 작성 (클래스 ID와 전체 이미지 좌표)
            label_content = f"{class_id} 0.5 0.5 1.0 1.0"
            
            with open(label_path, 'w') as f:
                f.write(label_content)

print("-" * 30)
print("모든 작업이 완료되었습니다!")
print("이제 data.yaml 파일의 클래스 정보를 수정해주세요.")