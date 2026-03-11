from backend.app import create_app
from backend.routes.quality.faculty import quality_faculty_bp
import json

app = create_app()
app.register_blueprint(quality_faculty_bp, url_prefix='/api/quality')

with app.test_client() as client:
    payload = {
        'name': 'Test Insert User',
        'department': 'Testing',
        'performance_rating': 75,
        'research_output': 2,
        'student_feedback_score': 80
    }
    resp = client.post('/api/quality/faculty', json=payload)
    print('Status code:', resp.status_code)
    try:
        print('Response JSON:', json.dumps(resp.get_json(), indent=2))
    except Exception:
        print('Response text:', resp.get_data(as_text=True))
