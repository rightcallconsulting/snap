# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-09-12 23:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0062_auto_20160912_2328'),
    ]

    operations = [
        migrations.AlterField(
            model_name='position',
            name='motionCoordinates',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
