#!/usr/bin/env python3
"""
Minimal API test to isolate the issue
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

# Apply httpx patch for Supabase client
import httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

from flask import Flask, jsonify
from controllers.transportController import FacultyController

app = Flask(__name__)

@app.route('/test-faculty')
def test_faculty():
    """Test faculty endpoint directly"""
    try:
        controller = FacultyController()
        
        # Mock request
        class MockRequest:
            args = {}
        
        # Temporarily replace request
        import controllers.transportController as tc
        original_request = tc.request
        tc.request = MockRequest()
        
        try:
            result = controller.get_faculty()
            print(f"Controller returned type: {type(result)}")
            print(f"Controller returned: {result}")
            
            if hasattr(result, 'get_json'):
                return result.get_json()
            elif hasattr(result, 'data'):
                return result.data
            else:
                return result
                
        finally:
            tc.request = original_request
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=5002, debug=True)
