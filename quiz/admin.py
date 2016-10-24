from django.contrib import admin

from .models import Team, Player

class TeamAdmin(admin.ModelAdmin):
	fields = []

class PlayerAdmin(admin.ModelAdmin):
	fields = []

admin.site.register(Team, TeamAdmin)
admin.site.register(Player, PlayerAdmin)
