# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-04-11 21:31
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0040_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testresult',
            name='player',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='quiz.Player'),
        ),
    ]