# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-11-28 04:24
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('playbook', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='play',
            name='unit',
            field=models.CharField(default='offense', max_length=100),
        ),
    ]