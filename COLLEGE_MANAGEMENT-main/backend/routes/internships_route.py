"""
This file contains the route registration for the internships blueprint.
It's separated to avoid circular imports and to make the code more maintainable.
"""
from .internships import bp, get_internship

# Register the get_internship route
@bp.route('/<string:internship_id>', methods=['GET'])
def get_internship_route(internship_id):
    """Route handler for getting a specific internship by ID"""
    return get_internship(internship_id)
