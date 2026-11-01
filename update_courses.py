import json
import os

courses_path = '/Users/sanjay/Documents/Work/alreems/alreems-frontend/src/data/courses.json'

with open(courses_path, 'r') as f:
    courses = json.load(f)

# Offline keywords
offline_keywords = ['silambam', 'karate', 'badminton', 'yoga', 'bharath', 'carnatic', 'tamil', 'business']

# Ensure Yoga and Business Studies exist
has_yoga = any('yoga' in c['title'].lower() for c in courses)
if not has_yoga:
    courses.append({
        "title": "Yoga Class",
        "description": "Improve your flexibility, strength, and mental well-being through guided yoga sessions.",
        "icon": "YOG",
        "gradient": "from-teal-400 to-green-500"
    })

has_business = any('business' in c['title'].lower() for c in courses)
if not has_business:
    courses.append({
        "title": "Business Studies",
        "description": "Learn the fundamentals of business, economics, and entrepreneurship.",
        "icon": "BUS",
        "gradient": "from-blue-600 to-indigo-800"
    })

for course in courses:
    title_lower = course['title'].lower()
    is_offline = any(keyword in title_lower for keyword in offline_keywords)
    if is_offline:
        course['mode'] = 'offline'
    else:
        course['mode'] = 'online'

with open(courses_path, 'w') as f:
    json.dump(courses, f, indent=2)

print("Updated courses.json")
