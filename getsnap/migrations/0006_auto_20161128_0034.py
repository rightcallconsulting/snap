# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-11-28 00:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('getsnap', '0005_auto_20161128_0031'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='payment_status',
            field=models.CharField(blank=True, default='', max_length=20, null=True),
        ),
    ]
