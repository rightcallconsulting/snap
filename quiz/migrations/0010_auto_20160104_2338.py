# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-04 23:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0009_position_routecoordinates'),
    ]

    operations = [
        migrations.AddField(
            model_name='position',
            name='blocker',
            field=models.NullBooleanField(),
        ),
        migrations.AddField(
            model_name='position',
            name='progressionRank',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='routeNum',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='runner',
            field=models.NullBooleanField(),
        ),
    ]