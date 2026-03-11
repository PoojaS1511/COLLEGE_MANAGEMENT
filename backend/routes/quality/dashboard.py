from flask import Blueprint, jsonify, request
from functools import wraps
from datetime import datetime
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Create blueprint
quality_dashboard_bp = Blueprint('quality_dashboard', __name__)

def parse_date(date_str):
    """Helper to parse date strings from various formats"""
    if not date_str:
        return datetime.min
    for fmt in ('%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y', '%m-%d-%Y'):
        try:
            return datetime.strptime(str(date_str), fmt)
        except ValueError:
            continue
    return datetime.min

@quality_dashboard_bp.route('/dashboard/kpis', methods=['GET', 'OPTIONS'])
def get_kpis():
    """Get dashboard KPIs for quality management"""
    try:
        # Get total faculty count
        faculty_result = execute_query("SELECT COUNT(*) as count FROM quality_facultyperformance", fetch_all=False)
        total_faculty = faculty_result.get('count', 0) if faculty_result else 0

        # Get pending audits
        pending_audits_result = execute_query(
            "SELECT COUNT(*) as count FROM quality_audits WHERE status IN ('pending', 'in_progress', 'Pending', 'In Progress')",
            fetch_all=False
        )
        pending_audits = pending_audits_result.get('count', 0) if pending_audits_result else 0

        # Get completed audits
        completed_audits_result = execute_query(
            "SELECT COUNT(*) as count FROM quality_audits WHERE status IN ('completed', 'Completed')",
            fetch_all=False
        )
        completed_audits = completed_audits_result.get('count', 0) if completed_audits_result else 0

        # Get grievances
        open_grievances = 0
        grievances_resolved = 0
        try:
            open_result = execute_query(
                "SELECT COUNT(*) as count FROM grievances WHERE status IN ('pending', 'in_progress', 'Pending', 'In Progress')",
                fetch_all=False
            )
            open_grievances = open_result.get('count', 0) if open_result else 0
            
            resolved_result = execute_query(
                "SELECT COUNT(*) as count FROM grievances WHERE status IN ('resolved', 'Resolved')",
                fetch_all=False
            )
            grievances_resolved = resolved_result.get('count', 0) if resolved_result else 0
        except Exception:
            pass

        # Get overall policy compliance rate
        policies_result = execute_query("SELECT compliance_status FROM quality_policy", fetch_all=True)
        policies = policies_result or []
        overall_policy_compliance_rate = 0
        if policies:
            compliant_count = sum(1 for p in policies if p.get('compliance_status', '').lower() == 'compliant')
            overall_policy_compliance_rate = round((compliant_count / len(policies)) * 100, 1) if len(policies) > 0 else 0

        # Get accreditation readiness score
        accreditation_result = execute_query("SELECT score, report_date FROM quality_accreditation", fetch_all=True)
        accreditation_readiness_score = 0
        if accreditation_result:
            sorted_acc = sorted(accreditation_result, key=lambda x: parse_date(x.get('report_date')), reverse=True)
            accreditation_readiness_score = float(sorted_acc[0]['score'] or 0) if sorted_acc else 0

        # Determine accreditation status based on score
        if accreditation_readiness_score >= 90:
            accreditation_status = 'A+'
        elif accreditation_readiness_score >= 80:
            accreditation_status = 'A'
        elif accreditation_readiness_score >= 70:
            accreditation_status = 'B+'
        else:
            accreditation_status = 'B'

        # Calculate quality score
        quality_score = round((overall_policy_compliance_rate + accreditation_readiness_score) / 2, 1) if overall_policy_compliance_rate > 0 else accreditation_readiness_score

        # Get active programs
        active_programs = 12
        try:
            dept_result = execute_query("SELECT COUNT(*) as count FROM departments", fetch_all=False)
            active_programs = dept_result.get('count', 0) if dept_result else 12
        except:
            pass

        # Mock monthly trends
        monthly_trends = {
            'faculty_performance': [75, 78, 82, 80, 85, 88],
            'audit_completion_rate': [60, 65, 70, 75, 80, 85],
            'grievance_resolution_rate': [70, 72, 75, 78, 80, 82],
            'policy_compliance': [80, 82, 85, 87, 90, 92]
        }

        kpis = {
            'total_faculty': total_faculty,
            'pending_audits': pending_audits,
            'open_grievances': open_grievances,
            'overall_policy_compliance_rate': overall_policy_compliance_rate,
            'accreditation_readiness_score': accreditation_readiness_score,
            'completed_audits': completed_audits,
            'grievances_resolved': grievances_resolved,
            'active_programs': active_programs,
            'accreditation_status': accreditation_status,
            'quality_score': quality_score,
            'monthly_trends': monthly_trends
        }

        return jsonify({
            'success': True,
            'data': kpis
        })
    except Exception as e:
        print(f"Error fetching dashboard KPIs: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_dashboard_bp.route('/dashboard/recent-activity', methods=['GET', 'OPTIONS'])
def get_recent_activity():
    """Get recent activity for quality management dashboard"""
    try:
        activities = []
        
        # Get latest audits
        try:
            audits_result = execute_query("SELECT * FROM quality_audits ORDER BY audit_date DESC", fetch_all=True)
            all_audits = audits_result or []
            sorted_audits = sorted(all_audits, key=lambda x: parse_date(x.get('audit_date')), reverse=True)
            for a in sorted_audits[:3]:
                activities.append({
                    'id': f"audit-{a['audit_id']}",
                    'type': 'audit',
                    'title': f"Audit: {a['department']}",
                    'description': f"Audit by {a['auditor_name']} is {a['status']}",
                    'status': a['status'],
                    'updated_at': a['audit_date']
                })
        except Exception as e:
            print(f"Error fetching recent audits: {e}")

        # Get latest grievances
        try:
            grievances_result = execute_query("SELECT * FROM quality_grivance ORDER BY resolution_date DESC", fetch_all=True)
            all_grievances = grievances_result or []
            sorted_grievances = sorted(all_grievances, key=lambda x: parse_date(x.get('resolution_date')), reverse=True)
            for g in sorted_grievances[:3]:
                activities.append({
                    'id': f"grievance-{g['grievance_id']}",
                    'type': 'grievance',
                    'title': f"Grievance: {g['description'][:50]}...",
                    'description': g.get('description', '')[:100] + '...' if len(g.get('description', '')) > 100 else g.get('description', ''),
                    'status': g['status'],
                    'updated_at': g['resolution_date']
                })
        except Exception as e:
            print(f"Error fetching recent grievances: {e}")
            
        # Get latest policies
        try:
            policies_result = execute_query("SELECT * FROM quality_policy ORDER BY last_review_date DESC", fetch_all=True)
            all_policies = policies_result or []
            sorted_policies = sorted(all_policies, key=lambda x: parse_date(x.get('last_review_date')), reverse=True)
            for p in sorted_policies[:3]:
                activities.append({
                    'id': f"policy-{p['policy_id']}",
                    'type': 'policy',
                    'title': f"Policy: {p['policy_name']}",
                    'description': f"Compliance status: {p['compliance_status']}",
                    'status': p['compliance_status'],
                    'updated_at': p['last_review_date']
                })
        except Exception as e:
            print(f"Error fetching recent policies: {e}")

        # Sort combined activities by updated_at
        activities.sort(key=lambda x: parse_date(x.get('updated_at')), reverse=True)
        
        # If no real data, return defaults
        if not activities:
            activities = [
                {
                    'id': 1,
                    'type': 'info',
                    'title': 'System Ready',
                    'description': 'Quality management system is online',
                    'status': 'completed',
                    'updated_at': '2026-01-01T00:00:00Z'
                }
            ]

        return jsonify({
            'success': True,
            'data': activities[:10]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

