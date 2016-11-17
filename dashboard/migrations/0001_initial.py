# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-11-17 22:30
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0007_alter_validators_add_error_messages'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('getsnap', '0001_initial'),
        ('playbook', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Coach',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=120, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('team', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team')),
            ],
        ),
        migrations.CreateModel(
            name='CustomQuiz',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_type', models.CharField(default='play', max_length=25)),
                ('number_of_questions', models.IntegerField(default=0)),
                ('ordering', models.CharField(default='recent', max_length=25)),
                ('quiz_type', models.CharField(default='identification', max_length=25)),
                ('position', models.CharField(default='', max_length=25)),
                ('type_of_assignment', models.CharField(default='all', max_length=25)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='myUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_a_player', models.BooleanField(default=False)),
                ('avatar_image', models.ImageField(blank=True, null=True, upload_to='profile')),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=30, null=True)),
                ('last_name', models.CharField(blank=True, max_length=30, null=True)),
                ('position', models.CharField(blank=True, max_length=10, null=True)),
                ('year', models.CharField(blank=True, choices=[('FR', 'Freshman'), ('SO', 'Sophomore'), ('JR', 'Junior'), ('SR', 'Senior'), ('RS FR', 'Redshirt Freshman'), ('RS SO', 'Redshirt Sophomore'), ('RS JR', 'Redshirt Junior'), ('RS SR', 'Redshirt Senior')], max_length=25, null=True)),
                ('unit', models.CharField(blank=True, max_length=20, null=True)),
                ('number', models.IntegerField(blank=True, null=True)),
                ('is_being_tested', models.BooleanField(default=False)),
                ('image_url', models.ImageField(blank=True, null=True, upload_to=b'')),
                ('starter', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('team', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=30, null=True)),
                ('position_group', models.BooleanField(default=False)),
                ('position_type', models.CharField(choices=[['QB', 'Quarterback'], ['SK', 'Skill Position'], ['OL', 'Offensive Lineman'], ['DL', 'Defensive Lineman'], ['LB', 'Linebacker'], ['DB', 'Defensive Back'], ['SP', 'Specialist']], default='Skill Position', max_length=20)),
                ('abbreviation', models.CharField(blank=True, max_length=3, null=True)),
                ('players', models.ManyToManyField(blank=True, to='dashboard.Player')),
                ('team', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team')),
            ],
            options={
                'verbose_name': 'Player Group',
                'verbose_name_plural': 'Player Groups',
            },
        ),
        migrations.CreateModel(
            name='QuestionAttempted',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.DateTimeField(auto_now_add=True)),
                ('score', models.IntegerField(null=True)),
                ('concept', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='playbook.Concept')),
                ('formation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='playbook.Formation')),
                ('play', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='playbook.Play')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dashboard.Player')),
            ],
            options={
                'verbose_name': 'Question Attempted',
                'verbose_name_plural': 'Questions Attempted',
            },
        ),
        migrations.CreateModel(
            name='Quiz',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=50, null=True)),
                ('unit', models.CharField(default='offense', max_length=25)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Quiz',
                'verbose_name_plural': 'Quizzes',
            },
        ),
        migrations.CreateModel(
            name='UserMethods',
            fields=[
            ],
            options={
                'proxy': True,
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.AddField(
            model_name='quiz',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='quiz',
            name='concepts',
            field=models.ManyToManyField(blank=True, to='playbook.Concept'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='formations',
            field=models.ManyToManyField(blank=True, to='playbook.Formation'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='players',
            field=models.ManyToManyField(related_name='players', to='dashboard.Player'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='plays',
            field=models.ManyToManyField(blank=True, to='playbook.Play'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='submissions',
            field=models.ManyToManyField(blank=True, related_name='submissions', to='dashboard.Player'),
        ),
        migrations.AddField(
            model_name='quiz',
            name='team',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team'),
        ),
        migrations.AddField(
            model_name='questionattempted',
            name='quiz',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dashboard.Quiz'),
        ),
        migrations.AddField(
            model_name='questionattempted',
            name='team',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team'),
        ),
        migrations.AddField(
            model_name='player',
            name='user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='myuser',
            name='user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='customquiz',
            name='player',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dashboard.Player'),
        ),
        migrations.AddField(
            model_name='customquiz',
            name='team',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='getsnap.Team'),
        ),
        migrations.AddField(
            model_name='coach',
            name='user',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
