# Generated by Django 5.1.1 on 2024-10-13 13:25

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ars', '0003_assignment_reviewers'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='members',
            field=models.ManyToManyField(blank=True, related_name='teams', to=settings.AUTH_USER_MODEL),
        ),
    ]
