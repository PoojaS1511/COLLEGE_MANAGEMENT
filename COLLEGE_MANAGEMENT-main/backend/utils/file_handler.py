import os
import uuid
from werkzeug.utils import secure_filename
from typing import Optional, List
import mimetypes

class FileHandler:
    """Handle file uploads, validation, and storage"""
    
    def __init__(self, upload_folder: str = None):
        self.upload_folder = upload_folder or os.path.join(os.getcwd(), 'uploads', 'hr_onboarding')
        self.allowed_extensions = {
            'identity_proof': ['pdf', 'jpg', 'jpeg', 'png'],
            'educational_certificates': ['pdf', 'jpg', 'jpeg', 'png'],
            'appointment_letter': ['pdf'],
            'experience_certificate': ['pdf', 'jpg', 'jpeg', 'png']
        }
        self.max_file_sizes = {
            'identity_proof': 5,  # 5MB
            'educational_certificates': 10,  # 10MB
            'appointment_letter': 5,  # 5MB
            'experience_certificate': 5  # 5MB
        }
        
        # Create upload directory if it doesn't exist
        self._ensure_upload_directory()
    
    def _ensure_upload_directory(self):
        """Ensure upload directory exists"""
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder, exist_ok=True)
    
    def allowed_file(self, filename: str, document_type: str = None) -> bool:
        """Check if file extension is allowed"""
        if not filename:
            return False
        
        extension = filename.rsplit('.', 1)[1].lower()
        
        if document_type and document_type in self.allowed_extensions:
            return extension in self.allowed_extensions[document_type]
        
        # Check against all allowed extensions
        all_allowed = set()
        for ext_list in self.allowed_extensions.values():
            all_allowed.update(ext_list)
        
        return extension in all_allowed
    
    def get_file_size_mb(self, file_path: str) -> float:
        """Get file size in MB"""
        if not os.path.exists(file_path):
            return 0.0
        
        size_bytes = os.path.getsize(file_path)
        size_mb = size_bytes / (1024 * 1024)
        return round(size_mb, 2)
    
    def validate_file(self, file, document_type: str) -> dict:
        """
        Validate uploaded file
        Returns dict with 'valid' boolean and 'message' string
        """
        if not file:
            return {'valid': False, 'message': 'No file provided'}
        
        if file.filename == '':
            return {'valid': False, 'message': 'No file selected'}
        
        # Check file extension
        if not self.allowed_file(file.filename, document_type):
            allowed_exts = ', '.join(self.allowed_extensions.get(document_type, []))
            return {'valid': False, 'message': f'File type not allowed. Allowed types: {allowed_exts}'}
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        file_size_mb = file_size / (1024 * 1024)
        max_size_mb = self.max_file_sizes.get(document_type, 5)
        
        if file_size_mb > max_size_mb:
            return {'valid': False, 'message': f'File size exceeds {max_size_mb}MB limit'}
        
        # Check MIME type
        mime_type, _ = mimetypes.guess_type(file.filename)
        if mime_type and not mime_type.startswith(('image/', 'application/pdf')):
            return {'valid': False, 'message': 'Invalid file type. Only images and PDF files are allowed'}
        
        return {'valid': True, 'message': 'File is valid'}
    
    def save_file(self, file, filename: str, subfolder: str = None) -> str:
        """
        Save file to upload directory
        Returns the file path
        """
        # Secure the filename
        secure_name = secure_filename(filename)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{secure_name}"
        
        # Create subfolder if specified
        if subfolder:
            subfolder_path = os.path.join(self.upload_folder, subfolder)
            if not os.path.exists(subfolder_path):
                os.makedirs(subfolder_path, exist_ok=True)
            file_path = os.path.join(subfolder_path, unique_filename)
        else:
            file_path = os.path.join(self.upload_folder, unique_filename)
        
        # Save the file
        file.save(file_path)
        
        return file_path
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    def get_file_info(self, file_path: str) -> dict:
        """Get file information"""
        if not os.path.exists(file_path):
            return {}
        
        stat = os.stat(file_path)
        filename = os.path.basename(file_path)
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        return {
            'filename': filename,
            'extension': extension,
            'size_bytes': stat.st_size,
            'size_mb': round(stat.st_size / (1024 * 1024), 2),
            'created_at': stat.st_ctime,
            'modified_at': stat.st_mtime,
            'mime_type': mimetypes.guess_type(filename)[0]
        }
    
    def cleanup_old_files(self, days_old: int = 30) -> int:
        """
        Clean up files older than specified days
        Returns number of files deleted
        """
        import time
        
        current_time = time.time()
        cutoff_time = current_time - (days_old * 24 * 60 * 60)
        
        deleted_count = 0
        
        for root, dirs, files in os.walk(self.upload_folder):
            for file in files:
                file_path = os.path.join(root, file)
                
                if os.path.getmtime(file_path) < cutoff_time:
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                    except Exception:
                        continue
        
        return deleted_count
    
    def get_storage_stats(self) -> dict:
        """Get storage statistics"""
        total_files = 0
        total_size = 0
        
        for root, dirs, files in os.walk(self.upload_folder):
            for file in files:
                file_path = os.path.join(root, file)
                total_files += 1
                total_size += os.path.getsize(file_path)
        
        return {
            'total_files': total_files,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'upload_folder': self.upload_folder
        }
    
    def create_document_preview(self, file_path: str, max_width: int = 300, max_height: int = 300) -> Optional[str]:
        """
        Create a preview image for documents (if it's an image)
        Returns preview file path or None if not applicable
        """
        try:
            from PIL import Image
            
            if not os.path.exists(file_path):
                return None
            
            # Check if it's an image file
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type or not mime_type.startswith('image/'):
                return None
            
            # Create preview
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize while maintaining aspect ratio
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Create preview filename
                filename = os.path.basename(file_path)
                name, ext = os.path.splitext(filename)
                preview_filename = f"{name}_preview.jpg"
                preview_path = os.path.join(os.path.dirname(file_path), preview_filename)
                
                # Save preview
                img.save(preview_path, 'JPEG', quality=85)
                
                return preview_path
                
        except ImportError:
            # PIL not available
            return None
        except Exception:
            # Error creating preview
            return None
    
    def validate_document_integrity(self, file_path: str) -> dict:
        """
        Validate document file integrity
        Returns dict with 'valid' boolean and 'message' string
        """
        try:
            if not os.path.exists(file_path):
                return {'valid': False, 'message': 'File does not exist'}
            
            # Check file size
            file_size = os.path.getsize(file_path)
            if file_size == 0:
                return {'valid': False, 'message': 'File is empty'}
            
            # Check file extension
            filename = os.path.basename(file_path)
            if '.' not in filename:
                return {'valid': False, 'message': 'Invalid file extension'}
            
            extension = filename.rsplit('.', 1)[1].lower()
            
            # Basic file type validation
            mime_type, _ = mimetypes.guess_type(filename)
            
            if extension == 'pdf':
                # Simple PDF validation
                with open(file_path, 'rb') as f:
                    header = f.read(5)
                    if header != b'%PDF-':
                        return {'valid': False, 'message': 'Invalid PDF file'}
            
            elif extension in ['jpg', 'jpeg']:
                # Simple JPEG validation
                with open(file_path, 'rb') as f:
                    header = f.read(2)
                    if header != b'\xff\xd8':
                        return {'valid': False, 'message': 'Invalid JPEG file'}
            
            elif extension == 'png':
                # Simple PNG validation
                with open(file_path, 'rb') as f:
                    header = f.read(8)
                    if header != b'\x89PNG\r\n\x1a\n':
                        return {'valid': False, 'message': 'Invalid PNG file'}
            
            return {'valid': True, 'message': 'File integrity verified'}
            
        except Exception as e:
            return {'valid': False, 'message': f'Error validating file: {str(e)}'}
    
    def get_document_type_display_name(self, document_type: str) -> str:
        """Get display name for document type"""
        display_names = {
            'identity_proof': 'Identity Proof',
            'educational_certificates': 'Educational Certificates',
            'appointment_letter': 'Appointment Letter',
            'experience_certificate': 'Experience Certificate'
        }
        return display_names.get(document_type, document_type.replace('_', ' ').title())
