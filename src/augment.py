import os
import cv2
import albumentations as A
import shutil
import numpy as np

# --- 1. 설정 (이 부분만 수정해서 사용하세요) ---

# 증강할 원본 이미지가 있는 폴더 경로 (상대 경로)
# 예: '../dataset/train/Defect' 또는 '../dataset/train/Good'
SOURCE_DIR = 'ai_Intrusion/dataset/train/Good'

# 증강된 이미지를 저장할 폴더 경로
# 원본 폴더와 같은 위치에 '_augmented'가 붙은 이름으로 자동 생성됩니다.
DEST_DIR = f"{SOURCE_DIR}_augmented"

# 원본 이미지 1장당 생성할 증강 이미지 개수
AUGMENT_SIZE = 20

# --- 2. 증강 파이프라인 정의 ---
# 다양한 증강 기술들을 조합합니다. p는 적용 확률입니다.
transform = A.Compose([
    A.HorizontalFlip(p=0.5),
    A.Rotate(limit=30, p=0.5, border_mode=cv2.BORDER_CONSTANT),
    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
    A.GaussianBlur(blur_limit=(3, 7), p=0.3),
    A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
])

# --- 3. 증강 실행 ---
# 이전에 증강했던 폴더가 있다면 삭제하고 새로 시작
if os.path.exists(DEST_DIR):
    shutil.rmtree(DEST_DIR)
os.makedirs(DEST_DIR, exist_ok=True)

image_files = [f for f in os.listdir(SOURCE_DIR) if f.endswith(('.jpg', '.jpeg', '.png'))]

print(f"'{SOURCE_DIR}' 폴더에서 총 {len(image_files)}개의 이미지를 찾았습니다.")
print(f"데이터 증강을 시작합니다... (이미지 1장당 {AUGMENT_SIZE}개 생성)")

# 각 이미지에 대해 증강을 반복
for filename in image_files:
    image_path = os.path.join(SOURCE_DIR, filename)
    
    # OpenCV의 한글 경로 문제를 해결하기 위해 numpy로 이미지를 읽어옵니다.
    image = cv2.imdecode(np.fromfile(image_path, dtype=np.uint8), cv2.IMREAD_COLOR)
    
    # Albumentations는 RGB를 사용하므로 색상 채널 순서를 BGR -> RGB로 변경
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # 설정된 횟수(AUGMENT_SIZE)만큼 증강 이미지 생성
    for i in range(AUGMENT_SIZE):
        augmented = transform(image=image)
        augmented_image = augmented['image']
        
        # 저장할 파일 이름 생성 (예: original_aug_0.jpg)
        name, ext = os.path.splitext(filename)
        new_filename = f"{name}_aug_{i}{ext}"
        save_path = os.path.join(DEST_DIR, new_filename)
        
        # 이미지를 다시 RGB -> BGR로 변환하여 저장
        augmented_image_bgr = cv2.cvtColor(augmented_image, cv2.COLOR_RGB2BGR)
        
        # 한글 경로에 저장 가능하도록 인코딩하여 저장
        is_success, im_buf_arr = cv2.imencode(ext, augmented_image_bgr)
        if is_success:
            im_buf_arr.tofile(save_path)

print("-" * 30)
print("데이터 증강 완료!")
print(f"총 {len(image_files) * AUGMENT_SIZE}개의 새로운 이미지가 '{DEST_DIR}' 폴더에 저장되었습니다.")