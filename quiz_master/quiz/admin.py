from django.contrib import admin

from .models import Play

class PlayAdmin(admin.ModelAdmin):

	fields = []

admin.site.register(Play, PlayAdmin)
