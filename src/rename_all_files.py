import os
from pathlib import Path

current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent 

targets_to_rename = [
    {
        'folder_path': project_root / 'dataset' / 'train' / 'Good',
        'prefix': 'good_train'
    },
    {
        'folder_path': project_root / 'dataset' / 'train' / 'Surface_Defect',
        'prefix': 'surface_defect_train'
    },
    {
        'folder_path': project_root / 'dataset' / 'train' / 'Structural_Defect',
        'prefix': 'structural_defect_train'
    },
    
    # --- 테스트(test) 데이터 ---
    {
        'folder_path': project_root / 'dataset' / 'test' / 'Good',
        'prefix': 'good_test'
    },
    {
        'folder_path': project_root / 'dataset' / 'test' / 'Surface_Defect',
        'prefix': 'surface_defect_test'
    },
    {
        'folder_path': project_root / 'dataset' / 'test' / 'Structural_Defect',
        'prefix': 'structural_defect_test'
    }
]

image_extensions = ['.jpg', '.jpeg', '.png']


print("파일 이름 일괄 변경을 시작합니다...")
print("-" * 30)

for target in targets_to_rename:
    TARGET_DIR = target['folder_path']
    NEW_PREFIX = target['prefix']
    
    if not TARGET_DIR.exists():
        print(f"경고: '{TARGET_DIR}' 폴더를 찾을 수 없어 건너뜁니다.")
        continue

    print(f"'{TARGET_DIR}' 폴더 작업 중...")
    
    count = 1
    files_to_rename = []
    
    for old_path in TARGET_DIR.iterdir():
        if old_path.is_file() and old_path.suffix.lower() in image_extensions:
            files_to_rename.append(old_path)
            
    for old_path in files_to_rename:
        new_name = f"{NEW_PREFIX}_{str(count).zfill(4)}{old_path.suffix.lower()}"
        new_path = TARGET_DIR / new_name
        
        os.rename(old_path, new_path)
        
        count += 1
        
    print(f"-> 총 {count - 1}개의 파일 이름을 변경했습니다.")

print("-" * 30)
print("모든 작업이 완료되었습니다.")