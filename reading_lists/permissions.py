from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class CannotDeleteDefaultList(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE' and obj.default_key is not None:
            return False
        return True
