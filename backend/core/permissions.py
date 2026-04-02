from rest_framework.permissions import BasePermission


class IsRole(BasePermission):
    """Base permission class. Subclasses declare allowed_roles."""
    allowed_roles: list[str] = []

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsManager(IsRole):
    allowed_roles = ['manager']


class IsFrontDesk(IsRole):
    allowed_roles = ['front_desk']


class IsBaker(IsRole):
    allowed_roles = ['baker']


class IsDecorator(IsRole):
    allowed_roles = ['decorator']


class IsPacking(IsRole):
    allowed_roles = ['packing']


class IsDriver(IsRole):
    allowed_roles = ['driver']


class IsInventoryClerk(IsRole):
    allowed_roles = ['inventory_clerk']


class IsManagerOrFrontDesk(IsRole):
    allowed_roles = ['manager', 'front_desk']


class IsManagerOrInventory(IsRole):
    allowed_roles = ['manager', 'inventory_clerk']
