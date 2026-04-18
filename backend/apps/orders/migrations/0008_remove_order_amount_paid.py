from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_batchingredient'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='order',
            name='amount_paid',
        ),
    ]
