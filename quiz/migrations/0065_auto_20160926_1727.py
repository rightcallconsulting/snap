# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-09-26 17:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0064_auto_20160920_1944'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='banner_image',
            field=models.ImageField(blank=True, null=True, upload_to=b''),
        ),
        migrations.AddField(
            model_name='team',
            name='endzone_art',
            field=models.ImageField(blank=True, null=True, upload_to=b''),
        ),
        migrations.AddField(
            model_name='team',
            name='midfield_art',
            field=models.ImageField(blank=True, null=True, upload_to=b''),
        ),
        migrations.AddField(
            model_name='team',
            name='sidebar_image',
            field=models.ImageField(blank=True, null=True, upload_to=b''),
        ),
    ]
