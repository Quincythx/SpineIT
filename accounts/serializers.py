from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import EmailVerificationCode

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'bio']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio', '')
        )
        return user
    

class SendVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # Check if email already belongs to a verified user
        if User.objects.filter(email=value, is_verified=True).exists():
            raise serializers.ValidationError("A verified account with this email already exists.")
        return value


class VerifyCodeAndRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8, validators=[validate_password])

    def validate_email(self, value):
        # Check if email already belongs to a verified user
        if User.objects.filter(email=value, is_verified=True).exists():
            raise serializers.ValidationError("A verified account with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate(self, data):
        # Verify the code
        try:
            code_obj = EmailVerificationCode.objects.filter(
                email=data['email'],
                code=data['code'],
                is_used=False
            ).latest('created_at')
        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError("Invalid verification code.")

        if code_obj.is_expired():
            raise serializers.ValidationError("Verification code has expired. Please request a new one.")

        # Mark code as used
        code_obj.is_used = True
        code_obj.save()

        # Create the user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            is_verified=True
        )
        data['user'] = user
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link.")

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, data['token']):
            raise serializers.ValidationError("Invalid or expired token.")

        data['user'] = user
        return data
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'avatar']
        read_only_fields = ['id']


class PublicUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'avatar', 'date_joined']
        read_only_fields = fields