"""
Django settings for backend project.
"""

from pathlib import Path
import os
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment detection
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() == "true"
DATABASE_URL = os.environ.get('DATABASE_URL')

# Basic settings
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "your-local-dev-key-here")
ALLOWED_HOSTS = [
    "reactproject-hl5c.onrender.com",
    "localhost",
    "127.0.0.1"
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "whiteboard",
    "channels",
    "corsheaders",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'
ASGI_APPLICATION = "backend.asgi.application"

# Database Configuration
if DATABASE_URL:
    # Production database (PostgreSQL from Render)
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Local development database (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Channel layers (required by Django Channels). Use Redis in production if REDIS_URL is set,
# otherwise fall back to the in-memory channel layer for local development.
REDIS_URL = os.environ.get("REDIS_URL")
if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [REDIS_URL],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        },
    }

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://reactproject-hl5c.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# Static files configuration - FIXED
STATIC_URL = '/static/'

# Static files configuration - FIXED
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Static files directories
STATICFILES_DIRS = []
if os.path.exists(os.path.join(BASE_DIR, 'frontend_build', 'static')):
    STATICFILES_DIRS.append(os.path.join(BASE_DIR, 'frontend_build', 'static'))

# --- ADDED: Ensure frontend build root is also served by WhiteNoise so
# manifest.json, favicon, logo192.png, logo512.png, index.html are available
if os.path.exists(os.path.join(BASE_DIR, 'frontend_build')):
    # allow WhiteNoise to serve files placed directly in frontend_build/
    STATICFILES_DIRS.append(os.path.join(BASE_DIR, 'frontend_build'))
    WHITENOISE_ROOT = os.path.join(BASE_DIR, 'frontend_build')

# Static files storage
if DATABASE_URL:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
else:
    # In development keep default; in production WhiteNoise will use WHITENOISE_ROOT
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# WhiteNoise configuration
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True

# Other settings
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
