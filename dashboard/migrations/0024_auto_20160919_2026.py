# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-09-19 20:26
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0023_auto_20160914_2000'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='quiz',
            options={'ordering': ['-created_at'], 'verbose_name': 'Quiz', 'verbose_name_plural': 'Quizzes'},
        ),
    ]
