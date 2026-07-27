from django.urls import path
from .views import (
    SendVerificationCodeView,
    VerifyCodeAndRegisterView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ProfileView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("send-code/", SendVerificationCodeView.as_view(), name="send-code"),
    path("verify-code-register/", VerifyCodeAndRegisterView.as_view(), name="verify-code-register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path('login/refresh/', TokenRefreshView.as_view(), name='login-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', ProfileView.as_view(), name='profile'),
]