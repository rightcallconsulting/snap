from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Coach, PlayerGroup, Concept, Quiz, QuestionAttempted, Player, Team

admin.site.site_header = "Right Call Consulting"
admin.site.site_title = "Snap site"

# Define an inline admin descriptor for Coach model
# which acts a bit like a singleton
class CoachInline(admin.StackedInline):
    model = Coach
    can_delete = False
    verbose_name_plural = 'coach'

class PlayerInline(admin.StackedInline):
    model = Player
    can_delete = False
    verbose_name_plural = 'player'

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (CoachInline, PlayerInline )

class PlayerGroupAdmin(admin.ModelAdmin):
	fields=[]

class ConceptAdmin(admin.ModelAdmin):
	fields = []

class QuizAdmin(admin.ModelAdmin):
	fields = []

class QuestionAttemptedAdmin(admin.ModelAdmin):
    fields = []

class TeamAdmin(admin.ModelAdmin):
	fields = []

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(PlayerGroup, PlayerGroupAdmin)
admin.site.register(Concept, ConceptAdmin)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(QuestionAttempted, QuestionAttemptedAdmin)
admin.site.register(Team, TeamAdmin)
