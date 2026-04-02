from django.conf import settings
from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import MeSerializer, StaffDetailSerializer, StaffPublicSerializer

_REFRESH_COOKIE = 'bakeflow_refresh'
_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days — matches REFRESH_TOKEN_LIFETIME
_COOKIE_PATH = '/api/auth/'


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Helper: attach the HttpOnly refresh cookie to a response."""
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=not getattr(settings, 'DEBUG', False),  # False in dev (HTTP), True in prod (HTTPS)
        samesite='Strict',
        max_age=_COOKIE_MAX_AGE,
        path=_COOKIE_PATH,
    )


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/token/
    Returns { access } in JSON body.
    Refresh token is moved out of the response body and set as an HttpOnly cookie.
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh = response.data.pop('refresh', None)
            if refresh:
                _set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    POST /api/auth/token/refresh/
    Reads the refresh token from the HttpOnly cookie (not the request body).
    Returns a fresh { access } token and rotates the cookie.
    """

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(_REFRESH_COOKIE)
        if not refresh_token:
            raise InvalidToken('No refresh token cookie found.')

        # Inject the cookie value into request.data for TokenRefreshView to process
        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # ROTATE_REFRESH_TOKENS=True means a new refresh token is issued — update the cookie
            new_refresh = response.data.pop('refresh', None)
            if new_refresh:
                _set_refresh_cookie(response, new_refresh)
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token and clears the cookie.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(_REFRESH_COOKIE)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass  # already invalid or expired — fine to ignore

        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(_REFRESH_COOKIE, path=_COOKIE_PATH)
        return response


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the authenticated user's public profile for the frontend.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class StaffViewSet(ModelViewSet):
    """
    /api/staff/          — list / create
    /api/staff/{id}/     — retrieve / partial_update
    /api/staff/{id}/deactivate/ — custom action
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'role']
    ordering_fields = ['name', 'join_date', 'status']
    ordering = ['name']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = User.objects.exclude(role='manager')
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    def get_serializer_class(self):
        if hasattr(self.request, 'user') and self.request.user.role == 'manager':
            return StaffDetailSerializer
        return StaffPublicSerializer

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        member = self.get_object()
        member.status = 'inactive'
        member.is_active = False
        member.save(update_fields=['status', 'is_active'])
        return Response({'status': 'deactivated'})
