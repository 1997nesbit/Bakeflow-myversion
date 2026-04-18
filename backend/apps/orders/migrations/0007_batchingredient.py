import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
        ('orders', '0006_remove_dailybatchitem_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='BatchIngredient',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity_used', models.DecimalField(decimal_places=3, max_digits=10)),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingredients', to='orders.dailybatchitem')),
                ('rollout', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='usages', to='inventory.dailyrollout')),
            ],
        ),
    ]
