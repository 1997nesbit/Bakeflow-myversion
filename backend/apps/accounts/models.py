import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import UserManager


class Role(models.TextChoices):
    MANAGER          = 'manager',         'Manager'
    FRONT_DESK       = 'front_desk',      'Front Desk'
    BAKER            = 'baker',           'Baker'
    DECORATOR        = 'decorator',       'Decorator'
    PACKING          = 'packing',         'Packing'
    DRIVER           = 'driver',          'Driver'
    INVENTORY_CLERK  = 'inventory_clerk', 'Inventory Clerk'


class UserStatus(models.TextChoices):
    ACTIVE   = 'active',   'Active'
    INACTIVE = 'inactive', 'Inactive'


class User(AbstractBaseUser, PermissionsMixin):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email      = models.EmailField(unique=True)
    phone      = models.CharField(max_length=20, unique=True)
    name       = models.CharField(max_length=150)
    role       = models.CharField(max_length=30, choices=Role.choices)
    status     = models.CharField(max_length=10, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    salary     = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    join_date  = models.DateField(auto_now_add=True)
    avatar_url = models.URLField(null=True, blank=True)

    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name', 'phone']

    class Meta:
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.name} ({self.role})'
