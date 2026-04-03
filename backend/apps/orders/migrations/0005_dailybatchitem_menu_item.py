import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_alter_order_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailybatchitem',
            name='menu_item',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='batch_items',
                to='orders.menuitem',
            ),
        ),
        migrations.AlterField(
            model_name='dailybatchitem',
            name='unit',
            field=models.CharField(default='pcs', max_length=30),
        ),
    ]
