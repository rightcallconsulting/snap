from django.contrib import admin

from .models import Play, Team, Test, Formation, Player, Position

class PlayAdmin(admin.ModelAdmin):
	fields = []

class TeamAdmin(admin.ModelAdmin):
	fields = []

class TestAdmin(admin.ModelAdmin):
	fields = []

class FormationAdmin(admin.ModelAdmin):
	fields = []

class PlayerAdmin(admin.ModelAdmin):
	fields = []

class PositionAdmin(admin.ModelAdmin):
	fields = []

admin.site.register(Play, PlayAdmin)
admin.site.register(Team, TeamAdmin)
admin.site.register(Test, TestAdmin)
admin.site.register(Formation, FormationAdmin)
admin.site.register(Player, PlayerAdmin)
admin.site.register(Position, PositionAdmin)
