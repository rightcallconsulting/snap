# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-08 18:08
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0011_auto_20160106_1754'),
    ]

    operations = [
        migrations.AddField(
            model_name='formation',
            name='unit',
            field=models.CharField(default='offense', max_length=100),
        ),
    ]
