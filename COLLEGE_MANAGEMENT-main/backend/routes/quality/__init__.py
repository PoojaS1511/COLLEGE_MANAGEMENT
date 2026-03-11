# Quality Management Module Blueprints
from .faculty import quality_faculty_bp
from .dashboard import quality_dashboard_bp
from .analytics import quality_analytics_bp
from .audits import quality_audits_bp
from .grievances import quality_grievances_bp
from .policies import quality_policies_bp
from .accreditation import quality_accreditation_bp

__all__ = [
    'quality_faculty_bp',
    'quality_dashboard_bp',
    'quality_analytics_bp',
    'quality_audits_bp',
    'quality_grievances_bp',
    'quality_policies_bp',
    'quality_accreditation_bp'
]
