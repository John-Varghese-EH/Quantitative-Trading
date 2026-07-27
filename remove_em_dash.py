import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '—' in content or '—' in content: 
            content = content.replace('—', '-')
            content = content.replace('—', '-')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass

for root, dirs, files in os.walk('.'):
    if any(ignore in root for ignore in ['.git', 'node_modules', '.pio', '.next']):
        continue
    for file in files:
        if file.endswith(('.md', '.cpp', '.h', '.ino', '.js', '.jsx', '.html', '.css', '.json')):
            replace_in_file(os.path.join(root, file))
