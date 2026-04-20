from rest_framework import serializers
from .models import MessageTemplate, Campaign, NotificationLog


class MessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'name', 'content', 'is_active',
            'is_automated', 'trigger_event',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_trigger_event(self, value):
        from .models import TriggerEvent
        if value and value not in TriggerEvent.values:
            raise serializers.ValidationError(f'Invalid trigger event: {value}')
        return value


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = [
            'id', 'name', 'message_content', 'recipients_count',
            'status', 'sent_at', 'scheduled_for',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'recipients_count', 'status', 'sent_at', 'created_at', 'updated_at']


class CampaignCreateSerializer(serializers.Serializer):
    """Used to validate + execute a bulk campaign send."""
    name            = serializers.CharField(max_length=200)
    message_content = serializers.CharField()
    recipients      = serializers.ListField(
        child=serializers.CharField(max_length=30),
        min_length=1,
        help_text='List of phone numbers to send to.',
    )
    scheduled_for   = serializers.DateTimeField(required=False, allow_null=True)


class NotificationLogSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True, default='')
    campaign_name = serializers.CharField(source='campaign.name', read_only=True, default='')

    class Meta:
        model = NotificationLog
        fields = [
            'id', 'template_name', 'campaign_name',
            'recipient', 'message', 'sent', 'error', 'created_at',
        ]
        read_only_fields = fields
