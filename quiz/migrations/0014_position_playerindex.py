# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-12 19:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0013_formation_offensiveformationid'),
    ]

    operations = [
        migrations.AddField(
            model_name='position',
            name='playerIndex',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
