# Gallery Backend API

A Django REST Framework backend for storing and managing images with metadata. Supports AWS S3 and MinIO for local development, with PostgreSQL as the database.

## Features

- **Image Upload & Management**: Upload images with metadata (title, description)
- **S3 Storage**: Seamless integration with AWS S3 for production and MinIO for local development
- **PostgreSQL**: Robust relational database for image metadata
- **REST API**: Full CRUD operations with pagination and filtering
- **Admin Interface**: Django admin panel for image management
- **CORS Support**: Configured for frontend integration

## Quick Start

### Local Development (Recommended)

```bash
# Install dependencies
uv sync

# Apply migrations
uv run python manage.py migrate

# Create admin user (optional)
uv run python manage.py createsuperuser

# Start the server
uv run python manage.py runserver 0.0.0.0:8000
```

Ensure PostgreSQL and MinIO are running (via docker-compose from parent directory).

### Docker Compose Setup

From the parent `/home/user/shrekify` directory:

```bash
docker-compose up -d
# Wait for services to be ready (5 seconds)
sleep 5

cd gallery/backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

**Services:**
- PostgreSQL: `localhost:5432` (user: postgres, password: postgres)
- MinIO S3 API: `localhost:9000`
- MinIO Console: `http://localhost:9001` (user: minioadmin, password: minioadmin)

## API Endpoints

### Images

- **List** (paginated): `GET /api/images/`
- **Create**: `POST /api/images/` (multipart/form-data)
- **Retrieve**: `GET /api/images/{id}/`
- **Update**: `PATCH /api/images/{id}/` (multipart/form-data)
- **Delete**: `DELETE /api/images/{id}/`
- **Bulk Delete**: `POST /api/images/bulk_delete/` (JSON: `{"ids": [...]}"`)
- **Search**: `GET /api/images/?q=search_term`
- **Stats**: `GET /api/images/stats/`

### Request/Response Examples

**Create Image:**
```bash
curl -X POST http://localhost:8000/api/images/ \
  -F "image=@/path/to/image.jpg" \
  -F "title=My Image" \
  -F "description=Image description"
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "image": "http://localhost:9000/gallery/a1b2c3d4-e5f6-7890-abcd-ef1234567890/image.jpg",
  "image_url": "http://localhost:9000/gallery/a1b2c3d4-e5f6-7890-abcd-ef1234567890/image.jpg",
  "title": "My Image",
  "description": "Image description",
  "size": 123456,
  "mime_type": "image/jpeg",
  "created_at": "2025-12-12T10:30:00Z",
  "updated_at": "2025-12-12T10:30:00Z"
}
```

**List Images (Paginated):**
```bash
curl http://localhost:8000/api/images/?page=1
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gallery

# AWS S3 / MinIO
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_STORAGE_BUCKET_NAME=gallery
AWS_S3_ENDPOINT_URL=http://localhost:9000  # Only for MinIO/custom endpoints
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=False  # True for production AWS

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Django
DEBUG=True
SECRET_KEY=your-secret-key
```

### Production Setup

Update `.env` with:

```bash
DATABASE_URL=postgresql://user:password@your-rds.amazonaws.com:5432/gallery
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1
AWS_S3_USE_SSL=True
DEBUG=False
SECRET_KEY=generate-a-secure-key
```

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql postgresql://postgres:postgres@localhost:5432/gallery

# Or check with docker
docker ps | grep postgres
```

### MinIO Connection Error
```bash
# Check MinIO is running
curl http://localhost:9000/minio/health/live

# Access MinIO Console
# http://localhost:9001 (minioadmin / minioadmin)
```

### Image Upload Fails
```bash
# Check S3 bucket exists
docker run --rm --network host minio/mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker run --rm --network host minio/mc ls myminio/gallery
```

## Admin Panel

Access Django admin at `http://localhost:8000/admin/`

Default credentials (after running `createsuperuser`):
- Username: admin
- Password: (set during creation)

Manage images, view metadata, and monitor storage usage.

## Development

### Create Migrations

```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
```

### Run Tests (if added)

```bash
uv run python manage.py test
```

### Database Shell

```bash
uv run python manage.py dbshell
```

## Project Structure

```
gallery/backend/
├── manage.py
├── pyproject.toml
├── .env
├── .env.example
├── README.md
├── gallery_api/              # Django project config
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
└── storage/                  # Image storage app
    ├── migrations/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── serializers.py
    ├── views.py
    └── urls.py (via gallery_api.urls)
```

## Tech Stack

- **Framework**: Django 6.0 + Django REST Framework
- **Database**: PostgreSQL 15
- **Storage**: AWS S3 / MinIO (S3-compatible)
- **Python**: 3.11+
- **Server**: Gunicorn (production)

## License

Same as parent project
