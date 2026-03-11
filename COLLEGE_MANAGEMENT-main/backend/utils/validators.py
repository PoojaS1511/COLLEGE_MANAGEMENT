import re
from typing import Union

def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Validate phone number (10 digits)"""
    if not phone:
        return False
    
    # Remove any non-digit characters
    phone_digits = re.sub(r'\D', '', phone)
    return len(phone_digits) == 10 and phone_digits.isdigit()

def validate_employee_id(employee_id: str) -> bool:
    """Validate employee ID format (EMPYYYYXXXX)"""
    if not employee_id:
        return False
    
    pattern = r'^EMP\d{8}$'
    return bool(re.match(pattern, employee_id))

def validate_name(name: str) -> bool:
    """Validate name (letters, spaces, hyphens, apostrophes only)"""
    if not name or len(name.strip()) < 2:
        return False
    
    pattern = r"^[a-zA-Z\s\-']+$"
    return bool(re.match(pattern, name))

def validate_password_strength(password: str) -> dict:
    """
    Validate password strength
    Returns dict with 'valid' boolean and 'message' string
    """
    if not password:
        return {'valid': False, 'message': 'Password is required'}
    
    if len(password) < 8:
        return {'valid': False, 'message': 'Password must be at least 8 characters long'}
    
    if len(password) > 128:
        return {'valid': False, 'message': 'Password must be less than 128 characters'}
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return {'valid': False, 'message': 'Password must contain at least one uppercase letter'}
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return {'valid': False, 'message': 'Password must contain at least one lowercase letter'}
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return {'valid': False, 'message': 'Password must contain at least one digit'}
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return {'valid': False, 'message': 'Password must contain at least one special character'}
    
    return {'valid': True, 'message': 'Password is valid'}

def validate_username(username: str) -> dict:
    """
    Validate username format
    Returns dict with 'valid' boolean and 'message' string
    """
    if not username:
        return {'valid': False, 'message': 'Username is required'}
    
    if len(username) < 3:
        return {'valid': False, 'message': 'Username must be at least 3 characters long'}
    
    if len(username) > 50:
        return {'valid': False, 'message': 'Username must be less than 50 characters'}
    
    # Username can contain letters, numbers, underscores, and hyphens
    pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(pattern, username):
        return {'valid': False, 'message': 'Username can only contain letters, numbers, underscores, and hyphens'}
    
    return {'valid': True, 'message': 'Username is valid'}

def validate_date_format(date_string: str) -> bool:
    """Validate date format (YYYY-MM-DD)"""
    if not date_string:
        return False
    
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if not re.match(pattern, date_string):
        return False
    
    try:
        year, month, day = map(int, date_string.split('-'))
        
        # Basic date validation
        if year < 1900 or year > 2100:
            return False
        
        if month < 1 or month > 12:
            return False
        
        if day < 1 or day > 31:
            return False
        
        # Check for valid days in month (simplified)
        if month in [4, 6, 9, 11] and day > 30:
            return False
        
        if month == 2:
            # Check for leap year
            is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
            if (is_leap and day > 29) or (not is_leap and day > 28):
                return False
        
        return True
        
    except (ValueError, IndexError):
        return False

def validate_time_format(time_string: str) -> bool:
    """Validate time format (HH:MM)"""
    if not time_string:
        return False
    
    pattern = r'^\d{2}:\d{2}$'
    if not re.match(pattern, time_string):
        return False
    
    try:
        hours, minutes = map(int, time_string.split(':'))
        
        if hours < 0 or hours > 23:
            return False
        
        if minutes < 0 or minutes > 59:
            return False
        
        return True
        
    except (ValueError, IndexError):
        return False

def validate_amount(amount: Union[str, float, int]) -> bool:
    """Validate monetary amount (non-negative, max 2 decimal places)"""
    if amount is None:
        return False
    
    try:
        amount_float = float(amount)
        
        if amount_float < 0:
            return False
        
        # Check for max 2 decimal places
        if abs(amount_float * 100) % 1 != 0:
            return False
        
        return True
        
    except (ValueError, TypeError):
        return False

def validate_file_type(filename: str, allowed_types: list) -> bool:
    """Validate file type against allowed types"""
    if not filename:
        return False
    
    file_extension = filename.split('.')[-1].lower()
    return file_extension in [ext.lower() for ext in allowed_types]

def validate_file_size(file_size_mb: float, max_size_mb: float) -> bool:
    """Validate file size against maximum allowed size"""
    return file_size_mb <= max_size_mb

def sanitize_string(input_string: str) -> str:
    """Sanitize string by removing potentially harmful characters"""
    if not input_string:
        return ""
    
    # Remove HTML tags and special characters
    sanitized = re.sub(r'<[^>]+>', '', input_string)
    sanitized = re.sub(r'[<>"\']', '', sanitized)
    
    return sanitized.strip()

def validate_json_structure(data: dict, required_fields: list) -> dict:
    """
    Validate JSON structure against required fields
    Returns dict with 'valid' boolean and 'missing_fields' list
    """
    if not isinstance(data, dict):
        return {'valid': False, 'missing_fields': required_fields}
    
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    return {
        'valid': len(missing_fields) == 0,
        'missing_fields': missing_fields
    }

def validate_shift_timing(start_time: str, end_time: str) -> dict:
    """
    Validate shift timing
    Returns dict with 'valid' boolean and 'message' string
    """
    if not validate_time_format(start_time) or not validate_time_format(end_time):
        return {'valid': False, 'message': 'Invalid time format'}
    
    try:
        start_hours, start_minutes = map(int, start_time.split(':'))
        end_hours, end_minutes = map(int, end_time.split(':'))
        
        start_total_minutes = start_hours * 60 + start_minutes
        end_total_minutes = end_hours * 60 + end_minutes
        
        # Check if end time is after start time
        if end_total_minutes <= start_total_minutes:
            return {'valid': False, 'message': 'End time must be after start time'}
        
        # Check if shift is reasonable (between 1 and 12 hours)
        shift_duration = end_total_minutes - start_total_minutes
        if shift_duration < 60 or shift_duration > 720:  # 1 hour to 12 hours
            return {'valid': False, 'message': 'Shift duration must be between 1 and 12 hours'}
        
        return {'valid': True, 'message': 'Shift timing is valid'}
        
    except (ValueError, IndexError):
        return {'valid': False, 'message': 'Invalid time format'}

def validate_leave_days(leave_days: dict) -> dict:
    """
    Validate leave policy days
    Returns dict with 'valid' boolean and 'message' string
    """
    if not isinstance(leave_days, dict):
        return {'valid': False, 'message': 'Leave policy must be a dictionary'}
    
    required_fields = ['casualLeave', 'sickLeave', 'earnedLeave']
    validation_result = validate_json_structure(leave_days, required_fields)
    
    if not validation_result['valid']:
        return {'valid': False, 'message': f'Missing required fields: {", ".join(validation_result["missing_fields"])}'}
    
    # Validate each leave type
    for field in required_fields:
        value = leave_days.get(field)
        
        if not isinstance(value, (int, float)) or value < 0:
            return {'valid': False, 'message': f'{field} must be a non-negative number'}
        
        if value > 365:  # Max 365 days per year
            return {'valid': False, 'message': f'{field} cannot exceed 365 days per year'}
    
    return {'valid': True, 'message': 'Leave policy is valid'}
