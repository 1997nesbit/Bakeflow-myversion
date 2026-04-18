from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0010_backfill_amount_paid'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='proof_of_delivery',
            field=models.ImageField(
                upload_to='proof_of_delivery/',
                null=True,
                blank=True,
                help_text='Photo uploaded by the driver upon delivery.',
            ),
        ),
    ]
