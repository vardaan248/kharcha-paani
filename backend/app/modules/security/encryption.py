"""
Security Module - Encryption and Password Management for Protected Bank Statements
Handles file encryption, password hashing, and secure data storage
"""

from cryptography.fernet import Fernet
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)


class FileEncryptionManager:
    """
    Manages encryption and decryption of bank statement files
    Stores sensitive statements with password protection
    """
    
    def __init__(self, encryption_key: str = None):
        """
        Initialize encryption manager
        
        Args:
            encryption_key: Base64-encoded encryption key (generates if None)
        """
        if encryption_key:
            self.key = encryption_key.encode()
        else:
            # In production, this should be stored securely
            self.key = Fernet.generate_key()
        self.cipher = Fernet(self.key)
    
    def encrypt_file(self, file_path: str, password: Optional[str] = None) -> dict:
        """
        Encrypt a bank statement file
        
        Args:
            file_path: Path to the file to encrypt
            password: Optional password for additional protection
        
        Returns:
            dict with encrypted data and metadata
        """
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            # Encrypt the file data
            encrypted_data = self.cipher.encrypt(file_data)
            
            metadata = {
                "encrypted_at": datetime.utcnow().isoformat(),
                "original_filename": os.path.basename(file_path),
                "file_size": len(file_data),
                "password_protected": password is not None,
                "encryption_method": "Fernet"
            }
            
            logger.info(f"File encrypted successfully: {metadata['original_filename']}")
            
            return {
                "encrypted_data": encrypted_data,
                "metadata": metadata,
                "password_hash": hash_password(password) if password else None
            }
        
        except Exception as e:
            logger.error(f"File encryption failed: {str(e)}")
            raise
    
    def decrypt_file(
        self,
        encrypted_data: bytes,
        password: Optional[str] = None,
        password_hash: Optional[str] = None
    ) -> bytes:
        """
        Decrypt a bank statement file
        
        Args:
            encrypted_data: Encrypted file data
            password: Password if password-protected
            password_hash: Stored hash to verify against
        
        Returns:
            Decrypted file data
        """
        try:
            # Verify password if required
            if password_hash and password:
                if not verify_password(password, password_hash):
                    raise ValueError("Incorrect password")
            elif password_hash and not password:
                raise ValueError("Password required for this file")
            
            # Decrypt the data
            decrypted_data = self.cipher.decrypt(encrypted_data)
            logger.info("File decrypted successfully")
            return decrypted_data
        
        except Exception as e:
            logger.error(f"File decryption failed: {str(e)}")
            raise


class PasswordManager:
    """
    Manages password hashing and verification
    Ensures sensitive data like file passwords are never stored in plain text
    """
    
    @staticmethod
    def create_password_hash(password: str) -> str:
        """
        Hash a password for storage
        
        Args:
            password: Plain text password
        
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        
        Args:
            plain_password: Plain text password to verify
            hashed_password: Previously hashed password
        
        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Convenience function to hash a password"""
    return PasswordManager.create_password_hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Convenience function to verify a password"""
    return PasswordManager.verify_password(plain_password, hashed_password)


class FileAccessLog:
    """
    Logs all access to encrypted files for audit purposes
    Tracks who accessed what and when
    """
    
    logs = []  # In production, store in database
    
    @classmethod
    def log_access(
        cls,
        file_name: str,
        action: str,
        success: bool,
        error_message: str = None,
        user_id: str = None
    ):
        """
        Log file access event
        
        Args:
            file_name: Name of accessed file
            action: Action performed (encrypt, decrypt, upload, download)
            success: Whether action succeeded
            error_message: Error message if action failed
            user_id: ID of user performing action
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "file_name": file_name,
            "action": action,
            "success": success,
            "error": error_message,
            "user_id": user_id
        }
        cls.logs.append(log_entry)
        logger.info(f"File access logged: {file_name} - {action} - {success}")
        
        # In production, persist to database
        return log_entry
    
    @classmethod
    def get_logs(cls, file_name: str = None, days: int = 30) -> list:
        """
        Retrieve access logs
        
        Args:
            file_name: Filter by specific file (optional)
            days: Number of days to look back
        
        Returns:
            List of log entries
        """
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        filtered_logs = [
            log for log in cls.logs
            if (datetime.fromisoformat(log["timestamp"]) > cutoff_time)
            and (file_name is None or log["file_name"] == file_name)
        ]
        
        return filtered_logs
