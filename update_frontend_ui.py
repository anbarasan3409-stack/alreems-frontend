import os
import re

frontend_dir = "/Users/sanjay/Documents/Work/alreems/alreems-frontend/src"

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith((".jsx", ".js")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content
            
            # Find all <input, <select, <textarea tags and inject text-gray-900 placeholder-gray-500
            def inject_text_color(match):
                tag_content = match.group(0)
                if 'className="' in tag_content:
                    if 'text-gray-900' not in tag_content:
                        tag_content = re.sub(r'className="([^"]+)"', r'className="\1 text-gray-900 placeholder-gray-500"', tag_content)
                else:
                    # If there's no className, add one before the closing bracket
                    # but only if it's an inline close /> or >
                    if tag_content.endswith('/>'):
                        tag_content = tag_content[:-2] + ' className="text-gray-900 placeholder-gray-500" />'
                    elif tag_content.endswith('>'):
                        tag_content = tag_content[:-1] + ' className="text-gray-900 placeholder-gray-500">'
                return tag_content

            new_content = re.sub(r'<(input|select|textarea)[^>]*>', inject_text_color, new_content)

            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {file}")
