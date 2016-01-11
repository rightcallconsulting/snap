from django.contrib import admin

from .models import Formation

class FormationAdmin(admin.ModelAdmin):
	change_form_template = 'admin/formation/formation_change_form.html'

	fields = []

admin.site.register(Formation, FormationAdmin)
