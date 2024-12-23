from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User  # Import your custom user model

# Register your custom User model with the admin site
admin.site.register(User)