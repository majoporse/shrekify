#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.

Usage:
    uv run python main.py              # Auto-init + runserver
    uv run python manage.py <command>  # Any Django command
    uv run python manage.py init_db    # Just initialize
"""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gallery_api.settings')
    try:
        from django.core.management import execute_from_command_line, call_command
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    
    call_command('init_db')

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
