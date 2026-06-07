"""
WSGI config for solarvision_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

from django.core.management import execute_from_command_line
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'solarvision_api.settings')

application = get_wsgi_application()

# Run migrations on cold start for Vercel's ephemeral /tmp/db.sqlite3
try:
    execute_from_command_line(['manage.py', 'migrate'])
except Exception as e:
    print("Migration error:", e)

# Vercel Serverless requires 'app'
app = application
