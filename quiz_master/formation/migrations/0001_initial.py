# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Formation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=60, verbose_name=b'Title')),
                ('pub_date', models.DateTimeField(auto_now_add=True, verbose_name=b'Publication Date', null=True)),
                ('description', models.TextField(help_text=b'a description of the formation', verbose_name=b'Description', blank=True)),
            ],
        ),
    ]
