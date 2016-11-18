from django.contrib import admin

from .models import Admin, Coach, Player, PlayerGroup

admin.site.site_header = "Right Call Consulting"
admin.site.site_title = "Snap site"

admin.site.register(Admin)
admin.site.register(Coach)
admin.site.register(Player)
admin.site.register(PlayerGroup)
