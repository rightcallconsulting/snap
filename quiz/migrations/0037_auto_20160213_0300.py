# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-02-13 03:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0036_auto_20160213_0250'),
    ]

    operations = [
        migrations.AlterField(
            model_name='position',
            name='gapYardX',
            field=models.FloatField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='position',
            name='gapYardY',
            field=models.FloatField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='position',
            name='zoneHeight',
            field=models.FloatField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='position',
            name='zoneWidth',
            field=models.FloatField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='position',
            name='zoneYardX',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='position',
            name='zoneYardY',
            field=models.FloatField(blank=True, max_length=200, null=True),
        ),
    ]
