from django.urls import path, include
from .views import LoginView, CookieTokenRefreshView, LogoutView, MeView

urlpatterns = [
    path('token/', LoginView.as_view(), name='auth-token'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
]
