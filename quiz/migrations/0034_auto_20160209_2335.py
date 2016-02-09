# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-02-09 23:35
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0033_testresult_string_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='position',
            name='CBAssignmentPlayerPosition',
        ),
        migrations.AddField(
            model_name='position',
            name='gapYardX',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='gapYardY',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='zoneHeight',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='zoneWidth',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='zoneYardX',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='position',
            name='zoneYardY',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
