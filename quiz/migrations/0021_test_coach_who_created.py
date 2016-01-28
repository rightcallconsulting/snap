# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-19 22:49
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('quiz', '0020_auto_20160116_1913'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='coach_who_created',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]