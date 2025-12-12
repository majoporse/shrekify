"""
Management command to initialize the database and S3 bucket on startup.

Usage:
    uv run python manage.py init_db
"""
import os
import time
import logging
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.db.utils import OperationalError
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Initialize database and S3 bucket"

    def handle(self, *args, **options):
        self.stdout.write("🚀 Initializing Gallery Backend...")
        
        # Step 0: Create database if needed
        self.stdout.write("🗄️  Creating database if needed...")
        self._create_database()
        
        # Step 1: Wait for database
        self.stdout.write("📊 Checking database connection...")
        self._wait_for_database()
        
        # Step 2: Run migrations
        self.stdout.write("🔄 Running migrations...")
        self._run_migrations()
        
        # Step 3: Initialize S3 bucket
        self.stdout.write("📦 Initializing S3 bucket...")
        self._init_s3_bucket()
        
        self.stdout.write(self.style.SUCCESS("✅ Initialization complete!"))

    def _create_database(self):
        """Create the database if it doesn't exist (PostgreSQL only)."""
        try:
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
            
            # Parse connection string
            import urllib.parse
            database_url = os.getenv(
                "DATABASE_URL",
                "postgresql://postgres:postgres@localhost:5432/gallery"
            )
            parsed = urllib.parse.urlparse(database_url)
            
            db_name = parsed.path.lstrip("/")
            db_user = parsed.username or "postgres"
            db_password = parsed.password or ""
            db_host = parsed.hostname or "localhost"
            db_port = parsed.port or 5432
            
            # Connect to default postgres database to create the target database
            try:
                conn = psycopg2.connect(
                    dbname="postgres",
                    user=db_user,
                    password=db_password,
                    host=db_host,
                    port=db_port,
                )
                conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                cursor = conn.cursor()
                
                # Check if database exists
                cursor.execute(
                    f"SELECT 1 FROM pg_database WHERE datname = %s",
                    (db_name,)
                )
                
                if not cursor.fetchone():
                    # Database doesn't exist, create it
                    cursor.execute(f"CREATE DATABASE {db_name}")
                    self.stdout.write(self.style.SUCCESS(f"✓ Database '{db_name}' created"))
                else:
                    self.stdout.write(f"  Database '{db_name}' already exists")
                
                cursor.close()
                conn.close()
            except psycopg2.OperationalError as e:
                self.stdout.write(
                    self.style.WARNING(f"⚠ Could not create database: {e}")
                )
                self.stdout.write("  (Database may already exist or require manual setup)")
                
        except ImportError:
            self.stdout.write(
                self.style.WARNING("⚠ psycopg2 not available for auto-creation")
            )


    def _wait_for_database(self, timeout=30):
        """Wait for database to be available."""
        start_time = time.time()
        db_alias = "default"
        
        while True:
            try:
                connection.ensure_connection()
                self.stdout.write(self.style.SUCCESS("✓ Database connected"))
                return
            except OperationalError as e:
                elapsed = time.time() - start_time
                if elapsed > timeout:
                    self.stdout.write(
                        self.style.ERROR(f"✗ Database connection timeout after {timeout}s")
                    )
                    raise
                
                remaining = timeout - int(elapsed)
                self.stdout.write(
                    f"  Waiting for database... ({remaining}s remaining)"
                )
                time.sleep(2)

    def _run_migrations(self):
        """Run Django migrations."""
        try:
            call_command("migrate", verbosity=1)
            self.stdout.write(self.style.SUCCESS("✓ Migrations completed"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Migration failed: {e}"))
            raise

    def _init_s3_bucket(self):
        """Initialize S3 bucket (MinIO or AWS)."""
        try:
            # Get S3 configuration
            bucket_name = os.getenv("AWS_STORAGE_BUCKET_NAME", "gallery")
            endpoint_url = os.getenv("AWS_S3_ENDPOINT_URL", None)
            region_name = os.getenv("AWS_S3_REGION_NAME", "us-east-1")
            access_key = os.getenv("AWS_ACCESS_KEY_ID")
            secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            use_ssl = os.getenv("AWS_S3_USE_SSL", "False").lower() == "true"
            
            # Initialize S3 client
            s3_kwargs = {
                "aws_access_key_id": access_key,
                "aws_secret_access_key": secret_key,
                "region_name": region_name,
            }
            
            if endpoint_url:
                s3_kwargs["endpoint_url"] = endpoint_url
            
            s3_client = boto3.client("s3", **s3_kwargs)
            
            # Check if bucket exists
            try:
                s3_client.head_bucket(Bucket=bucket_name)
                self.stdout.write(f"  Bucket '{bucket_name}' already exists")
            except ClientError as e:
                # Bucket doesn't exist, create it
                error_code = int(e.response["Error"]["Code"])
                if error_code == 404:
                    self.stdout.write(f"  Creating bucket '{bucket_name}'...")
                    try:
                        if region_name and region_name != "us-east-1":
                            s3_client.create_bucket(
                                Bucket=bucket_name,
                                CreateBucketConfiguration={"LocationConstraint": region_name}
                            )
                        else:
                            s3_client.create_bucket(Bucket=bucket_name)
                        
                        # Set public-read ACL
                        s3_client.put_bucket_acl(Bucket=bucket_name, ACL="public-read")
                        
                        self.stdout.write(
                            self.style.SUCCESS(f"✓ Bucket '{bucket_name}' created")
                        )
                    except ClientError as create_error:
                        if "BucketAlreadyOwnedByYou" not in str(create_error):
                            raise
                        self.stdout.write(f"  Bucket '{bucket_name}' already exists")
                else:
                    raise
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f"⚠ S3 initialization warning: {e}")
            )
            self.stdout.write(
                "  (This is OK if using managed S3 or if bucket setup is manual)"
            )
