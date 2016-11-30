from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import PasswordResetForm

from .models import CustomUser, Team

class CustomUserAdmin(UserAdmin):
    def reset_password(self, request, user_id):
        if not self.has_change_permission(request):
            raise PermissionDenied
        user = get_object_or_404(self.model, pk=user_id)

        form = PasswordResetForm(data={'email': user.email})
        form.is_valid()

        form.save(email_template_name='my_template.html')
        return HttpResponseRedirect('..')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Team)
