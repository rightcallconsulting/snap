# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-06-06 20:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0043_remove_position_blockingassignmentobject'),
    ]

    operations = [
        migrations.AddField(
            model_name='position',
            name='blockingAssignmentObject',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
