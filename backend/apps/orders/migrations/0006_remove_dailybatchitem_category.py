from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0005_dailybatchitem_menu_item'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailybatchitem',
            name='category',
        ),
    ]
