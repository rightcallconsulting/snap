# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-07-18 04:13
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0052_auto_20160718_0333'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='team',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='quiz.Team'),
        ),
    ]