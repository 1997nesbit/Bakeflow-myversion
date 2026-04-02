from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django import forms

from .models import User, Role, UserStatus


class UserAdminCreationForm(UserCreationForm):
    """
    Used by the admin 'Add user' page.
    Replaces the default form so we get email instead of username,
    and our custom required fields (name, phone, role).
    """
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'name', 'phone', 'role')


class UserAdminChangeForm(UserChangeForm):
    """Used by the admin 'Change user' page."""
    class Meta(UserChangeForm.Meta):
        model = User
        fields = ('email', 'name', 'phone', 'avatar_url', 'role', 'status', 'salary', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm

    list_display  = ('email', 'name', 'role', 'status', 'is_staff', 'is_active')
    list_filter   = ('role', 'status', 'is_staff', 'is_active')
    search_fields = ('email', 'name', 'phone')
    ordering      = ('name',)

    fieldsets = (
        (None,              {'fields': ('email', 'password')}),
        ('Personal info',   {'fields': ('name', 'phone', 'avatar_url')}),
        ('Role & Employment', {'fields': ('role', 'status', 'salary', 'join_date')}),
        ('Permissions',     {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'name', 'phone', 'role', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('join_date',)
