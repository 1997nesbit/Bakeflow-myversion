from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accepts { username, password } where username can be email or phone.
    Adds role and name claims to the JWT access token payload.
    """

    # Override so the parent __init__ creates a 'username' field, not 'email'
    username_field = 'username'

    def validate(self, attrs):
        username = attrs.get('username', '').strip()
        password = attrs.get('password', '')

        # Look up user by email first, then by phone
        user = None
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(phone=username)
            except User.DoesNotExist:
                pass

        if user is None or not user.check_password(password) or not user.is_active:
            raise AuthenticationFailed('No active account found with the given credentials.')

        self.user = user
        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['name'] = user.name
        return token


class MeSerializer(serializers.ModelSerializer):
    """Returned by GET /api/auth/me/ — minimal payload for the frontend."""

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'email', 'phone', 'avatar_url']


class StaffPublicSerializer(serializers.ModelSerializer):
    """Used for non-manager callers — no sensitive fields."""

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'avatar_url']


class StaffDetailSerializer(serializers.ModelSerializer):
    """Used for manager callers — includes salary and employment details."""

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'email', 'phone', 'status', 'salary', 'join_date', 'avatar_url']


class StaffCreateSerializer(serializers.ModelSerializer):
    """Used for POST /api/staff/ — accepts a plaintext password and hashes it."""

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'email', 'phone', 'status', 'salary', 'join_date', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class StaffUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/staff/{id}/ — password is optional; omitting it leaves it unchanged."""

    password = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'email', 'phone', 'status', 'salary', 'join_date', 'password']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
