import json
import os

courses_path = '/Users/sanjay/Documents/Work/alreems/alreems-frontend/src/data/courses.json'
images_dir = '/Users/sanjay/Documents/Work/alreems/alreems-frontend/public/assets/courses'

with open(courses_path, 'r') as f:
    courses = json.load(f)

# Map titles to probable image filenames
image_map = {
    "Aari Class": "aari_class.jpeg",
    "Abacus Class": "abacus.jpeg",
    "Arabic Language": "arabic.jpeg",
    "Art and Craft Class": "art_craft.jpeg",
    "Badminton Coaching": "badminton.jpeg",
    "Bharathanatyam": "bharathanatyam.jpeg",
    "Carnatic Vocal": "carnatic_vocal.jpeg",
    "English Language": "english.jpeg",
    "Flute Class": "flute.jpeg",
    "French Language": "french.jpeg",
    "Guitar Class": "guitar.jpeg",
    "Hindi Language": "hindi.jpeg",
    "Keyboard Class": "keyboard.jpeg",
    "Magic Class": "magic_class.jpeg",
    "Parai Class": "parai_class.jpeg",
    "Academic Tuition": "school.jpeg",
    "Sewing & Embroidery": "sewing.jpeg",
    "Silambam Class": "silambam.jpeg",
    "Tamil Language": "tamil.jpeg",
    "Tamilar Kaaviyamum": "tamilar_kaaviyamum.jpeg",
    "Vedic Maths": "vedic.jpeg",
    "Violin Class": "violin.jpeg"
}

for course in courses:
    title = course['title']
    if title in image_map:
        course['image'] = f"/assets/courses/{image_map[title]}"
    else:
        course['image'] = None

with open(courses_path, 'w') as f:
    json.dump(courses, f, indent=2)

print("Updated courses.json with images")
