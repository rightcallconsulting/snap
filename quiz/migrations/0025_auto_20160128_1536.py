# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-28 15:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0024_auto_20160128_1528'),
    ]

    operations = [
        migrations.AddField(
            model_name='testresult',
            name='completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='testresult',
            name='most_recent',
            field=models.BooleanField(default=False),
        ),
    ]
