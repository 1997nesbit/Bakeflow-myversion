from django.db import migrations


class Migration(migrations.Migration):
    """Reverses 0011 — removes the proof_of_delivery column from orders_order."""

    dependencies = [
        ('orders', '0011_order_proof_of_delivery'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='proof_of_delivery',
        ),
    ]
