# Generated by Django 5.1.1 on 2024-10-31 16:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ars', '0005_remove_team_members_team_members'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='submission',
            name='status',
        ),
        migrations.AddField(
            model_name='submission',
            name='attachment',
            field=models.URLField(blank=True, null=True),
        ),
    ]
