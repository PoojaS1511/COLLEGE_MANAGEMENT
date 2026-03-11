from flask import Response, request, jsonify
from flask_sse import sse
from datetime import datetime
import json
from functools import wraps
from supabase_client import get_supabase
from flask_jwt_extended import jwt_required, get_jwt_identity

# Initialize Supabase client
supabase = get_supabase()

def create_event_message(event_type, payload):
    """Helper function to create an SSE message"""
    return 'data: {}\n\n'.format(json.dumps({
        'type': event_type,
        'event': payload['event_type'],
        'data': payload['new'] if 'new' in payload else payload['old'],
        'timestamp': datetime.utcnow().isoformat()
    }))

def realtime_bp(app):
    @app.route('/api/realtime/analytics')
    @jwt_required()
    def analytics_events():
        """Stream real-time analytics updates to connected clients"""
        def event_stream():
            # Initial connection message
            yield 'data: {}\n\n'.format(json.dumps({
                'type': 'connection_established',
                'message': 'Real-time analytics connection established',
                'timestamp': datetime.utcnow().isoformat()
            }))
            
            # Create a queue to hold events
            from queue import Queue
            event_queue = Queue()
            
            def on_admission_change(payload, *args):
                event_queue.put(('admission_update', payload))
            
            def on_grade_change(payload, *args):
                event_queue.put(('performance_update', payload))
                
            def on_booking_change(payload, *args):
                event_queue.put(('utilization_update', payload))
            
            # Set up a channel for database changes
            channel = supabase.channel('analytics_updates')
            
            # Listen for admission changes
            channel.on('postgres_changes', {
                'event': '*',
                'schema': 'public',
                'table': 'admissions'
            }, on_admission_change)
            
            # Listen for grade changes
            channel.on('postgres_changes', {
                'event': '*',
                'schema': 'public',
                'table': 'grades'
            }, on_grade_change)
            
            # Listen for booking changes
            channel.on('postgres_changes', {
                'event': '*',
                'schema': 'public',
                'table': 'bookings'
            }, on_booking_change)
            
            # Subscribe to the channel
            channel.subscribe()
            
            try:
                while True:
                    # Check for new events
                    try:
                        event_type, payload = event_queue.get(timeout=30)
                        yield create_event_message(event_type, payload)
                    except Exception as e:
                        # Send heartbeat if no events for 30 seconds
                        yield 'data: {}\n\n'.format(json.dumps({
                            'type': 'heartbeat',
                            'timestamp': datetime.utcnow().isoformat()
                        }))
                        
            except GeneratorExit:
                # Clean up when client disconnects
                channel.unsubscribe()
        
        return Response(
            event_stream(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'  # Disable buffering for nginx
            }
        )
    
    return app
