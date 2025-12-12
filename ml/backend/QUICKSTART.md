# Quick Start: PostgreSQL + MinIO (S3)

## Local Development with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, MinIO, pgAdmin)
docker-compose up -d

# Wait a few seconds for services to be ready
sleep 5

# Install dependencies
cd backend
uv sync

# Run migrations
uv run python manage.py migrate

# Start the server
uv run python manage.py runserver
```

**Services running:**

- PostgreSQL: `localhost:5432` (user: postgres, password: postgres)
- MinIO S3 API: `localhost:9000`
- MinIO Console UI: `http://localhost:9001` (user: minioadmin, password: minioadmin)
- pgAdmin: `http://localhost:5050` (user: admin@shrekify.com, password: admin)

## Manual Setup (Without Docker)

```bash
# Install dependencies
cd backend
uv sync

# Start PostgreSQL (if not running)
# Option 1: Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Option 2: Using system postgres
# Make sure the database 'shrekify' exists
psql -U postgres -c "CREATE DATABASE shrekify;" 2>/dev/null || true

# Start MinIO (S3-compatible storage)
# Option 1: Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Option 2: Download MinIO binary
# wget https://dl.min.io/server/minio/release/linux-amd64/minio
# chmod +x minio
# ./minio server /data --console-address ":9001"

# Create bucket (using MinIO Client)
docker run --rm --network host minio/mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker run --rm --network host minio/mc mb myminio/media --ignore-existing
docker run --rm --network host minio/mc anonymous set public myminio/media

# Run migrations
uv run python manage.py migrate

# Start the server
uv run python manage.py runserver
```

## Production (AWS S3)

Update `.env` with real AWS credentials:

```bash
DATABASE_URL=postgresql://user:password@your-rds-instance.us-east-1.rds.amazonaws.com:5432/shrekify

# Get from AWS IAM: Create user with S3 permissions
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=True

# Remove MinIO endpoint for production
# AWS_S3_ENDPOINT_URL=

# Optional: CloudFront CDN
# AWS_S3_CUSTOM_DOMAIN=cdn.yourapp.com
```

Then:

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

## Configuration Reference

### PostgreSQL

```
DATABASE_URL=postgresql://[user[:password]@][host][:port]/[dbname]

Examples:
postgresql://postgres:postgres@localhost:5432/shrekify
postgresql://user:pass@db.example.com:5432/myapp
```

### AWS S3 / MinIO

```bash
# MinIO (local development)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_STORAGE_BUCKET_NAME=media
AWS_S3_ENDPOINT_URL=http://localhost:9000
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=False

# AWS S3 (production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=True
# Don't set AWS_S3_ENDPOINT_URL for real AWS
```

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Verify connection
psql postgresql://postgres:postgres@localhost:5432/shrekify

# Check if Postgres is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5432
```

### MinIO Connection Error

```bash
# Check if MinIO is running
curl http://localhost:9000/minio/health/live

# Access MinIO Console
# Open http://localhost:9001 in browser
# Login: minioadmin / minioadmin

# Verify S3 storage works
python manage.py shell
>>> from django.core.files.storage import default_storage
>>> default_storage.exists('test.txt')
```

### Bucket Not Found Error

```bash
# Create bucket manually using MinIO client
docker run --rm --network host minio/mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker run --rm --network host minio/mc mb myminio/media
docker run --rm --network host minio/mc anonymous set public myminio/media
```

### Migration Errors

```bash
# Reset database (dev only!)
dropdb shrekify
createdb shrekify
uv run python manage.py migrate
```
