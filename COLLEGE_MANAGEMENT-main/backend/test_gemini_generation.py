"""
Test Gemini AI roadmap generation
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    import google.generativeai as genai
    print("✅ Gemini AI library imported successfully")
    
    # Configure Gemini
    GEMINI_API_KEY = "AIzaSyAsOCdplJIByoMwNGT361AavkBp8T14c2A"
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    print("✅ Gemini AI configured successfully")
    
    # Test generation
    print("\n=== Testing Roadmap Generation ===")
    career_interest = "AI Engineer"
    weeks = 10
    
    prompt = f"""
You are a career guidance expert. Generate a detailed {weeks}-week learning roadmap for someone who wants to become a {career_interest}.

For each week, provide:
1. Week number (1 to {weeks})
2. Topic/Focus area
3. Brief description (2-3 sentences, actionable)
4. Milestone (what should be achieved by end of week)
5. Optional resource link (free learning material URL - use real URLs from platforms like YouTube, freeCodeCamp, Coursera free courses, etc.)

Format your response as a JSON array with this exact structure:
[
  {{
    "week_no": 1,
    "topic": "Topic name",
    "description": "Brief actionable description",
    "milestone": "What to achieve",
    "resource_link": "https://example.com/resource"
  }}
]

Make it practical, beginner-friendly, and progressive. Focus on hands-on learning.
Return ONLY the JSON array, no additional text.
"""
    
    print(f"Generating roadmap for: {career_interest}")
    print(f"Number of weeks: {weeks}")
    
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    print(f"\n=== Raw Response ===")
    print(response_text[:500])  # Print first 500 chars
    
    # Try to parse JSON
    import json
    
    # Clean up response
    if response_text.startswith('```json'):
        response_text = response_text[7:]
    if response_text.startswith('```'):
        response_text = response_text[3:]
    if response_text.endswith('```'):
        response_text = response_text[:-3]
    
    response_text = response_text.strip()
    
    print(f"\n=== Cleaned Response ===")
    print(response_text[:500])  # Print first 500 chars
    
    try:
        roadmap_steps = json.loads(response_text)
        print(f"\n✅ Successfully parsed JSON")
        print(f"Number of steps: {len(roadmap_steps)}")
        print(f"\nFirst step:")
        print(json.dumps(roadmap_steps[0], indent=2))
    except json.JSONDecodeError as e:
        print(f"\n❌ Failed to parse JSON: {e}")
        
except ImportError as e:
    print(f"❌ Failed to import Gemini AI: {e}")
    print("Please install: pip install google-generativeai")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

