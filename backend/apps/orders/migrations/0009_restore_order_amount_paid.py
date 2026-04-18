from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0008_remove_order_amount_paid'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='amount_paid',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
