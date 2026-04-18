from django.db import migrations
from django.db.models import Sum


def backfill_amount_paid(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    FinancialTransaction = apps.get_model('finance', 'FinancialTransaction')

    for order in Order.objects.all():
        total_paid = (
            FinancialTransaction.objects
            .filter(order_id=order.pk, direction='in')
            .aggregate(t=Sum('amount'))['t'] or 0
        )
        order.amount_paid = total_paid
        order.save(update_fields=['amount_paid'])


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_restore_order_amount_paid'),
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(backfill_amount_paid, migrations.RunPython.noop),
    ]
