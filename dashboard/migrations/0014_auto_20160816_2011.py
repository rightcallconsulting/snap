# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-08-16 20:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0013_auto_20160816_1538'),
    ]

    operations = [
        migrations.AddField(
            model_name='concept',
            name='conceptJson',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='concept',
            name='name',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='concept',
            name='unit',
            field=models.CharField(blank=True, default='offense', max_length=25, null=True),
        ),
    ]
