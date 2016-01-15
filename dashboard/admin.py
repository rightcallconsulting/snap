from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from dashboard.models import Coach, Athlete
# Register your models here.

# Define an inline admin descriptor for Coach model
# which acts a bit like a singleton
class CoachInline(admin.StackedInline):
    model = Coach
    can_delete = False
    verbose_name_plural = 'coach'

class AthleteInline(admin.StackedInline):
    model = Athlete
    can_delete = False
    verbose_name_plural = 'coach'

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (CoachInline, AthleteInline )

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
