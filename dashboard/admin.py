from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from dashboard.models import Coach
from quiz.models import Player
# Register your models here.

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

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
