# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-09-12 21:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0060_play_scoutname'),
    ]

    operations = [
        migrations.AddField(
            model_name='position',
            name='motionCoordinates',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
