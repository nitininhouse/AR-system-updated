# Generated by Django 5.1.1 on 2024-10-31 22:46

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ars', '0006_remove_submission_status_submission_attachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed')], default='pending', max_length=10),
        ),
        migrations.AlterField(
            model_name='review',
            name='assignment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ars.assignment'),
        ),
        migrations.AlterField(
            model_name='review',
            name='comments',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='review',
            name='iteration_number',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='review',
            name='reviewer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]