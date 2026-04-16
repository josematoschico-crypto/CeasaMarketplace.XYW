import os
import re

def add_referrer_policy(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <img tags
    # We want to find <img ... > and see if it has referrerPolicy
    # This regex is a bit simple but should work for most React components
    
    def replacement(match):
        img_tag = match.group(0)
        if 'referrerPolicy' in img_tag:
            return img_tag
        
        # Insert referrerPolicy="no-referrer" before the closing > or />
        if img_tag.endswith('/>'):
            return img_tag[:-2] + ' referrerPolicy="no-referrer" />'
        elif img_tag.endswith('>'):
            return img_tag[:-1] + ' referrerPolicy="no-referrer" >'
        return img_tag

    # Match <img followed by anything until > or />
    new_content = re.sub(r'<img[^>]+>', replacement, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

def main():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                add_referrer_policy(os.path.join(root, file))

if __name__ == "__main__":
    main()
