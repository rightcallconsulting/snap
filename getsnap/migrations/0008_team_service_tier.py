# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-11-28 00:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('getsnap', '0007_auto_20161128_0035'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='service_tier',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
