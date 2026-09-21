from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with ADMIN role or superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to staff, write access only to admin.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user.role == 'ADMIN' or request.user.is_superuser)

class CanManageDocuments(permissions.BasePermission):
    """
    Allows staff and admin to create and view documents.
    Allows only admin to delete documents.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return bool(request.user.role == 'ADMIN' or request.user.is_superuser)
        return True
