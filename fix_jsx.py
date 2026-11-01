import os

frontend_dir = "/Users/sanjay/Documents/Work/alreems/alreems-frontend/src"
bad_string = '= className="text-gray-900 placeholder-gray-500">'
good_string = '=>'

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith((".jsx", ".js")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            if bad_string in content:
                new_content = content.replace(bad_string, good_string)
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {file}")
