"""
Management command: seed_orders
Creates 20 realistic-looking orders spread across all statuses.

Usage:
    py manage.py seed_orders
    py manage.py seed_orders --count 30   # override count
    py manage.py seed_orders --clear      # wipe existing orders first
"""
import random
import string
from datetime import date, time, timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from apps.accounts.models import User
from apps.customers.models import Customer
from apps.orders.models import (
    DeliveryType, Order, OrderItem, OrderStatus,
    OrderType, PaymentMethod, PaymentStatus, PaymentTerms,
)


# ---------------------------------------------------------------------------
# Realistic seed data
# ---------------------------------------------------------------------------
MENU_ITEMS = [
    ("Chocolate Fudge Cake", 35_000),
    ("Red Velvet Cake", 40_000),
    ("Vanilla Birthday Cake", 30_000),
    ("Strawberry Cheesecake", 45_000),
    ("Carrot Cake", 28_000),
    ("Black Forest Cake", 38_000),
    ("Lemon Drizzle Cake", 25_000),
    ("Cupcakes Assorted (12 pcs)", 22_000),
    ("Cinnamon Rolls (6 pcs)", 15_000),
    ("Croissants (4 pcs)", 12_000),
    ("Banana Bread Loaf", 18_000),
    ("Wedding Tier Cake (3-layer)", 180_000),
    ("Macarons Box (16 pcs)", 32_000),
    ("Eclairs (6 pcs)", 20_000),
    ("Mango Mousse Cake", 42_000),
]

STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.PENDING,          # duplicate to raise frequency
    OrderStatus.PAID,
    OrderStatus.BAKER,
    OrderStatus.BAKER,
    OrderStatus.QUALITY,
    OrderStatus.DECORATOR,
    OrderStatus.READY,
    OrderStatus.READY,
    OrderStatus.DISPATCHED,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
]

DELIVERY_TYPES = [DeliveryType.PICKUP, DeliveryType.PICKUP, DeliveryType.DELIVERY]

SAMPLE_ADDRESSES = [
    "Masaki, Plot 45, Dar es Salaam",
    "Mikocheni B, House 12, Dar es Salaam",
    "Kinondoni, Near Makumbusho, Dar es Salaam",
    "Mbezi Beach, Block C, Dar es Salaam",
    "Kariakoo, Shop 22, Dar es Salaam",
]

SPECIAL_NOTES = [
    "Please write 'Happy Birthday Sarah!' on top",
    "Nut-free — customer has allergy",
    "Extra icing on the sides",
    "Gluten-free base if possible",
    "Add gold foil decoration",
    "",
    "",
    "",
]


def _tracking_id() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"TRK-{suffix}"


class Command(BaseCommand):
    help = "Seed the database with realistic sample orders."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count", type=int, default=20,
            help="Number of orders to create (default: 20)",
        )
        parser.add_argument(
            "--clear", action="store_true",
            help="Delete all existing orders before seeding",
        )

    def handle(self, *args, **options):
        count: int = options["count"]

        if options["clear"]:
            deleted, _ = Order.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing order(s)."))

        # ── Prerequisites ───────────────────────────────────────────────────
        customers = list(Customer.objects.all())
        if not customers:
            raise CommandError(
                "No Customer records found. "
                "Run your customer import first, or create at least one customer."
            )

        # Pick a staff user to be `created_by` (prefer front_desk, fall back to any)
        staff = (
            User.objects.filter(role="front_desk", is_active=True).first()
            or User.objects.filter(is_active=True).first()
        )
        if not staff:
            raise CommandError("No active User found. Create a user (superuser) first.")

        today = date.today()
        created_count = 0

        for i in range(count):
            customer = random.choice(customers)
            status = random.choice(STATUSES)
            delivery_type = random.choice(DELIVERY_TYPES)
            order_type = OrderType.MENU
            payment_terms = random.choice([PaymentTerms.UPFRONT, PaymentTerms.ON_DELIVERY])

            # Pick 1-3 items
            chosen_items = random.sample(MENU_ITEMS, k=random.randint(1, 3))
            total_price = sum(price for _, price in chosen_items)

            # Payment logic
            if status in (OrderStatus.PENDING,):
                payment_status = random.choice([PaymentStatus.UNPAID, PaymentStatus.DEPOSIT])
            elif status == OrderStatus.DELIVERED:
                payment_status = PaymentStatus.PAID
            else:
                payment_status = random.choice([PaymentStatus.PAID, PaymentStatus.DEPOSIT])

            if payment_status == PaymentStatus.PAID:
                amount_paid = total_price
            elif payment_status == PaymentStatus.DEPOSIT:
                amount_paid = round(total_price * 0.5)
            else:
                amount_paid = 0

            payment_method = (
                random.choice([
                    PaymentMethod.CASH,
                    PaymentMethod.MOBILE_MONEY,
                    PaymentMethod.BANK_TRANSFER,
                ])
                if amount_paid > 0 else None
            )

            # Dates — spread across next 7 days
            pickup_date = today + timedelta(days=random.randint(0, 7))
            pickup_hour = random.randint(9, 17)
            pickup_time = time(pickup_hour, random.choice([0, 30]))

            # For statuses past baker, record posted_to_baker_at
            posted_to_baker_at = None
            if status not in (OrderStatus.PENDING, OrderStatus.PAID):
                posted_to_baker_at = timezone.now() - timedelta(hours=random.randint(1, 8))

            dispatched_at = None
            if status in (OrderStatus.DISPATCHED, OrderStatus.DELIVERED):
                dispatched_at = timezone.now() - timedelta(hours=random.randint(1, 4))

            is_advance = pickup_date > today + timedelta(days=1)

            # Ensure unique tracking id
            for _ in range(10):
                tid = _tracking_id()
                if not Order.objects.filter(tracking_id=tid).exists():
                    break
            else:
                self.stdout.write(self.style.WARNING("Could not generate unique tracking ID, skipping one order."))
                continue

            order = Order.objects.create(
                tracking_id=tid,
                customer=customer,
                order_type=order_type,
                status=status,
                delivery_type=delivery_type,
                delivery_address=random.choice(SAMPLE_ADDRESSES) if delivery_type == DeliveryType.DELIVERY else "",
                pickup_date=pickup_date,
                pickup_time=pickup_time,
                is_advance_order=is_advance,
                estimated_minutes=random.choice([30, 45, 60, 90, 120]),
                total_price=total_price,
                amount_paid=amount_paid,
                payment_status=payment_status,
                payment_method=payment_method,
                payment_terms=payment_terms,
                special_notes=random.choice(SPECIAL_NOTES),
                posted_to_baker_at=posted_to_baker_at,
                dispatched_at=dispatched_at,
                created_by=staff,
            )

            # Create order items
            for item_name, item_price in chosen_items:
                qty = random.randint(1, 3)
                OrderItem.objects.create(
                    order=order,
                    name=item_name,
                    quantity=qty,
                    price=item_price,
                )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f"✓ Created {created_count} order(s) seeded across {len(set(STATUSES))} statuses.")
        )
