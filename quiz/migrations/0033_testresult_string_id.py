# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-02-03 17:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0032_auto_20160202_1659'),
    ]

    operations = [
        migrations.AddField(
            model_name='testresult',
            name='string_id',
            field=models.CharField(blank=True, default='Temp', max_length=100, null=True),
        ),
    ]