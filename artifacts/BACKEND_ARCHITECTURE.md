# Bakeflow — Django Backend Architecture

> Reference document for backend implementation. Based on full analysis of the frontend mockup: 4 portals, 7 roles, ~40 pages, and a complex order state machine.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema-models)
4. [Service Layer](#4-service-layer-solid-srp--ocp)
5. [Role-Based Permissions](#5-role-based-permissions-solid-isp--lsp)
6. [API Endpoints](#6-api-endpoints)
7. [Performance Strategy](#7-performance-strategy)
8. [Security](#8-security)
9. [Implementation Phases](#9-implementation-phases)
10. [SOLID Principles Reference](#10-key-solid-applications)

---

## 1. Project Structure

```
bakeflow_backend/
├── config/                        # Django project root
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── apps/
│   ├── accounts/                  # Custom User + Role system
│   ├── orders/                    # Order lifecycle + state machine
│   ├── inventory/                 # Stock, rollouts, suppliers
│   ├── customers/                 # Customer records + loyalty
│   ├── finance/                   # Expenses, debts, payments
│   ├── tasks/                     # Staff task management
│   ├── notifications/             # ✅ Customer messaging: MessageTemplate, Campaign, NotificationLog
│   ├── messaging/                 # Internal messaging (future)
│   └── reports/                   # Analytics aggregation
│
├── core/                          # Shared utilities (SOLID: SRP)
│   ├── permissions.py             # Role-based DRF permissions
│   ├── pagination.py              # Consistent pagination
│   ├── exceptions.py              # Custom exception handlers
│   ├── mixins.py                  # Reusable view behaviors
│   └── services/
│       ├── base.py                # BaseService abstract class
│       └── state_machine.py       # Order state transitions
│
├── tests/
│   ├── accounts/
│   ├── orders/
│   ├── inventory/
│   └── finance/
│
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
│
└── manage.py
```

---

## 2. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Django 5.x + DRF | Mature, batteries-included |
| Auth | JWT via `djangorestframework-simplejwt` | Stateless, role in payload |
| DB | PostgreSQL | JSON fields, transactions, indexing |
| Cache | Redis | Session cache, rate limiting, real-time |
| Async tasks | Celery + Redis | Notifications, recurring expense checks |
| Real-time | Django Channels (WebSocket) | Live order status updates |
| Filtering | `django-filter` | DRY query filtering |
| Validation | DRF serializers + custom validators | Layered validation |
| Docs | drf-spectacular (OpenAPI 3) | Auto-generated API docs |

---

## 3. Database Schema (Models)

### `accounts` app

```python
class Role(TextChoices):
    MANAGER         = 'manager'
    FRONT_DESK      = 'front_desk'
    BAKER           = 'baker'
    DRIVER          = 'driver'
    INVENTORY_CLERK = 'inventory_clerk'
    # DECORATOR and PACKING removed 2026-04-02 — simplified role set

class User(AbstractBaseUser, PermissionsMixin):
    id          = UUIDField(primary_key=True, default=uuid4)
    email       = EmailField(unique=True)
    phone       = CharField(max_length=20, unique=True)
    name        = CharField(max_length=150)
    role        = CharField(choices=Role, max_length=30)
    status      = CharField(choices=['active','inactive'], default='active')
    salary      = DecimalField(max_digits=12, decimal_places=2, null=True)
    join_date   = DateField(auto_now_add=True)
    avatar_url  = URLField(null=True, blank=True)

    # indexes: role, status
```

### `customers` app

```python
class Customer(TimestampedModel):
    id              = UUIDField(primary_key=True)
    name            = CharField(max_length=150)
    phone           = CharField(max_length=20, unique=True)
    email           = EmailField(null=True, blank=True)
    is_gold         = BooleanField(default=False)
    notes           = TextField(blank=True)
    total_orders    = PositiveIntegerField(default=0)  # denormalized counter
    total_spent     = DecimalField(max_digits=14, decimal_places=2, default=0)
    last_order_date = DateField(null=True)

    # index: phone, is_gold
```

### `orders` app

```python
class OrderStatus(TextChoices):
    PENDING    = 'pending'
    PAID       = 'paid'
    BAKER      = 'baker'
    QUALITY    = 'quality'
    DECORATOR  = 'decorator'
    # PACKING  = 'packing'  # future enhancement — packing step removed from flow; value retained in DB for historical rows
    READY      = 'ready'
    DISPATCHED = 'dispatched'
    DELIVERED  = 'delivered'

class PaymentStatus(TextChoices):
    UNPAID  = 'unpaid'
    DEPOSIT = 'deposit'
    PAID    = 'paid'

class Order(TimestampedModel):
    id                = UUIDField(primary_key=True)
    tracking_id       = CharField(max_length=20, unique=True, db_index=True)

    customer          = ForeignKey(Customer, on_delete=PROTECT, related_name='orders')

    order_type        = CharField(choices=['menu', 'custom'])
    status            = CharField(choices=OrderStatus, default='pending', db_index=True)
    special_notes     = TextField(blank=True)
    note_for_customer = TextField(blank=True)

    pickup_date       = DateField()
    pickup_time       = TimeField()
    is_advance_order  = BooleanField(default=False)
    estimated_minutes = PositiveIntegerField(default=60)

    delivery_type     = CharField(choices=['pickup', 'delivery'])
    delivery_address  = TextField(blank=True)

    total_price       = DecimalField(max_digits=12, decimal_places=2)
    amount_paid       = DecimalField(max_digits=12, decimal_places=2, default=0)
    # amount_paid is a cached derived field — always recomputed from
    # SUM(transactions WHERE order=self AND direction='in') by _sync_payment().
    # Never increment directly with +=. See OrderService._sync_payment().
    payment_status    = CharField(choices=PaymentStatus, default='unpaid')
    payment_method    = CharField(choices=[...], null=True)
    payment_terms     = CharField(choices=['upfront', 'on_delivery'])

    assigned_to       = ForeignKey(User, null=True, related_name='assigned_orders', on_delete=SET_NULL)
    posted_to_baker_at = DateTimeField(null=True)
    dispatched_at     = DateTimeField(null=True)
    driver            = ForeignKey(User, null=True, related_name='deliveries', on_delete=SET_NULL)
    driver_accepted   = BooleanField(null=True)
    driver_delivered  = BooleanField(default=False)
    proof_of_delivery = ImageField(upload_to='proofs/', null=True, blank=True)

    created_by        = ForeignKey(User, related_name='created_orders', on_delete=PROTECT)

    class Meta:
        indexes = [
            Index(fields=['status', 'pickup_date']),
            Index(fields=['payment_status']),
            Index(fields=['tracking_id']),
        ]

class OrderItem(models.Model):
    order            = ForeignKey(Order, related_name='items', on_delete=CASCADE)
    name             = CharField(max_length=200)
    quantity         = PositiveIntegerField()
    price            = DecimalField(max_digits=10, decimal_places=2)
    customization    = TextField(blank=True)
    is_custom        = BooleanField(default=False)

    # Custom cake details (null if not a custom cake)
    cake_flavour     = CharField(max_length=100, blank=True)
    icing_type       = CharField(max_length=100, blank=True)
    weight_kg        = DecimalField(max_digits=4, decimal_places=2, null=True)
    cake_description = TextField(blank=True)

class OrderStatusHistory(models.Model):
    """Audit trail for every status transition."""
    order       = ForeignKey(Order, related_name='status_history', on_delete=CASCADE)
    from_status = CharField(max_length=20)
    to_status   = CharField(max_length=20)
    changed_by  = ForeignKey(User, on_delete=SET_NULL, null=True)
    changed_at  = DateTimeField(auto_now_add=True)
    note        = TextField(blank=True)

class MenuItem(models.Model):
    name              = CharField(max_length=200)
    category          = CharField(choices=['cake', 'bread', 'pastry', 'snack', 'beverage'])
    price             = DecimalField(max_digits=10, decimal_places=2)
    estimated_minutes = PositiveIntegerField()
    description       = TextField(blank=True)
    is_active         = BooleanField(default=True)
```

### `inventory` app

```python
class Supplier(TimestampedModel):
    id    = UUIDField(primary_key=True)
    name  = CharField(max_length=200)
    phone = CharField(max_length=20)
    email = EmailField(blank=True)

class SupplierProduct(models.Model):
    supplier = ForeignKey(Supplier, related_name='products', on_delete=CASCADE)
    name     = CharField(max_length=200)

class InventoryItem(TimestampedModel):
    id            = UUIDField(primary_key=True)
    name          = CharField(max_length=200, db_index=True)
    category      = CharField(choices=['ingredient', 'packaging', 'finished'])
    quantity      = DecimalField(max_digits=10, decimal_places=3)
    unit          = CharField(max_length=30)
    min_stock     = DecimalField(max_digits=10, decimal_places=3)
    cost_per_unit = DecimalField(max_digits=10, decimal_places=2)
    supplier      = ForeignKey(Supplier, null=True, on_delete=SET_NULL)
    last_restocked = DateField(null=True)

    @property
    def stock_health(self) -> float:
        """Returns ratio: <0.5 critical, <1.0 low, >=1.0 ok."""
        return float(self.quantity / self.min_stock) if self.min_stock else 1.0

class StockEntry(TimestampedModel):
    id             = UUIDField(primary_key=True)
    inventory_item = ForeignKey(InventoryItem, on_delete=PROTECT)
    quantity       = DecimalField(max_digits=10, decimal_places=3)
    cost_per_unit  = DecimalField(max_digits=10, decimal_places=2)
    total_cost     = DecimalField(max_digits=12, decimal_places=2)
    supplier_name  = CharField(max_length=200)
    invoice_ref    = CharField(max_length=100, blank=True)
    date           = DateField()
    added_by       = ForeignKey(User, on_delete=PROTECT)

class DailyRollout(TimestampedModel):
    id             = UUIDField(primary_key=True)
    inventory_item = ForeignKey(InventoryItem, on_delete=PROTECT)
    quantity       = DecimalField(max_digits=10, decimal_places=3)
    purpose        = CharField(max_length=300)
    rolled_out_by  = ForeignKey(User, on_delete=PROTECT)
    date           = DateField(db_index=True)
    time           = TimeField()

class DailyBatchItem(TimestampedModel):
    """Baker's daily production log. Decoupled from menu items (2026-04-05)."""
    product_name       = CharField(max_length=200)  # free-text, baker-supplied
    quantity_baked     = PositiveIntegerField()
    quantity_remaining = PositiveIntegerField()
    unit               = CharField(max_length=30, default='pcs')
    baked_by           = ForeignKey(User, on_delete=PROTECT)
    baked_at           = DateTimeField()
    notes              = TextField(blank=True)
    # menu_item FK and category field removed (migrations 0005 reverted intent, 0006 drops category)

class BatchIngredient(models.Model):
    """Records how much of a rolled-out inventory item was consumed by a batch."""
    id            = UUIDField(primary_key=True)
    batch         = ForeignKey(DailyBatchItem, on_delete=CASCADE, related_name='ingredients')
    rollout       = ForeignKey('inventory.DailyRollout', on_delete=PROTECT, related_name='usages')
    quantity_used = DecimalField(max_digits=10, decimal_places=3)

# Write payload accepted by POST /api/production/batches/:
#   { product_name, quantity_baked, notes?, ingredients: [{rollout_id, quantity_used}] }
# ProductionService.create_batch() validates each rollout has sufficient remaining
# capacity (select_for_update) before creating batch + ingredient rows atomically.
#
# GET /api/inventory/rollouts/ annotates each rollout with quantity_used
# (Coalesce Subquery over BatchIngredient) so the baker form can show availability.
```

### `finance` app

`FinancialTransaction` is the **single source of truth** for all money movement. There is no separate `Payment` or `Expense` model — one table handles both directions via the `direction` discriminator.

```python
class TransactionDirection(TextChoices):
    IN  = 'in'   # revenue: order payment, walk-in sale
    OUT = 'out'  # expense: stock purchase, business expense

class TransactionType(TextChoices):
    ORDER_PAYMENT    = 'order_payment'
    SALE             = 'sale'
    STOCK_EXPENSE    = 'stock_expense'
    BUSINESS_EXPENSE = 'business_expense'

class FinancialTransaction(TimestampedModel):
    id             = UUIDField(primary_key=True)
    date           = DateField(db_index=True)
    amount         = DecimalField(max_digits=14, decimal_places=2)
    direction      = CharField(choices=TransactionDirection, db_index=True)
    type           = CharField(choices=TransactionType, db_index=True)
    payment_method = CharField(choices=PaymentMethod, blank=True)
    description    = CharField(max_length=300)
    recorded_by    = ForeignKey(User, on_delete=PROTECT)

    # Revenue links — null for expense rows
    order = ForeignKey('orders.Order', null=True, blank=True, on_delete=SET_NULL, related_name='transactions')
    sale  = ForeignKey('orders.Sale',  null=True, blank=True, on_delete=SET_NULL, related_name='transactions')

    # Expense-only fields — blank for revenue rows
    category         = CharField(max_length=50, blank=True)
    paid_to          = CharField(max_length=200, blank=True)
    receipt_ref      = CharField(max_length=100, blank=True)
    notes            = TextField(blank=True)
    recurring        = BooleanField(default=False)
    recurring_period = CharField(choices=['weekly', 'monthly', 'yearly'], null=True)

    class Meta:
        indexes = [
            Index(fields=['direction', 'date']),
            Index(fields=['type', 'date']),
        ]
```

**Revenue rows** are created automatically as side effects inside `OrderService.record_payment()` and `SaleViewSet.create()` — never by direct API calls to `POST /api/transactions/`.

**Expense rows** (`direction='out'`) are the only rows created via `POST /api/transactions/`. The `direction` field is set server-side; clients never supply it.

**`FinancialTransaction` is indexed on `(order_id)` via the FK** — querying a single order's payment history is O(log n).

### `notifications` app

```python
class TriggerEvent(TextChoices):
    ORDER_READY_PICKUP   = 'ORDER_READY_PICKUP'
    ORDER_READY_DELIVERY = 'ORDER_READY_DELIVERY'
    ORDER_DISPATCHED     = 'ORDER_DISPATCHED'
    ORDER_DELIVERED      = 'ORDER_DELIVERED'
    PAYMENT_RECEIVED     = 'PAYMENT_RECEIVED'
    CUSTOM               = 'CUSTOM'

class MessageTemplate(TimestampedModel):
    id            = UUIDField(primary_key=True)
    name          = CharField(max_length=200)
    content       = TextField()       # supports {{variable}} placeholders
    trigger_event = CharField(choices=TriggerEvent, default='CUSTOM')
    is_automated  = BooleanField(default=False)
    is_active     = BooleanField(default=True)
    created_by    = ForeignKey(User, on_delete=PROTECT)

class Campaign(TimestampedModel):
    id              = UUIDField(primary_key=True)
    name            = CharField(max_length=200)
    template        = ForeignKey(MessageTemplate, null=True, on_delete=SET_NULL)
    message_content = TextField()     # resolved copy — may differ from template after edit
    recipients      = JSONField()     # list of phone number strings
    sent_at         = DateTimeField(null=True)
    created_by      = ForeignKey(User, on_delete=PROTECT)

class NotificationLog(TimestampedModel):
    id        = UUIDField(primary_key=True)
    campaign  = ForeignKey(Campaign, on_delete=CASCADE, related_name='logs')
    recipient = CharField(max_length=20)   # phone number
    status    = CharField(choices=['queued','sent','failed'], default='queued')
    sent_at   = DateTimeField(null=True)
    error_msg = TextField(blank=True)
```

**`NotificationService`:** resolves `{{variable}}` placeholders from a context dict, creates a `Campaign` + `NotificationLog` rows, calls `_send_via_gateway()` (Briq.tz stub).

**Self-healing reminder guard (in `OrderViewSet`, not `NotificationService`):**
`send_payment_reminder` and `send_overdue_notice` actions:
1. Compute `balance = total_price − amount_paid`
2. If `balance == 0` but `payment_status` is stale → auto-sync `payment_status = 'paid'`, save, return HTTP 400 (`"Order is fully paid. Status has been corrected."`)
3. Otherwise, pass `balance` and `total_price` as explicit `extra_context` so SMS templates never receive a stale zero-balance from the DB field.

```env
# Required in backend .env for production SMS:
BRIQ_API_KEY=your_key_here
BRIQ_SENDER_ID=BakeflowTZ
# Endpoint: POST https://karibu.briq.tz/v1/messaging/send/
```

---

## 4. Service Layer (SOLID: SRP + OCP)


Every non-trivial business operation lives in a **service class**, not in views or serializers. Views handle HTTP only.

```python
# core/services/base.py
class BaseService(ABC):
    """All services inherit from this. Enforces single responsibility."""
    pass

# orders/services.py
class OrderService(BaseService):
    def create_order(self, validated_data, created_by) -> Order:
        # Pops amount_paid from validated_data — not stored on Order directly.
        # If amount_paid > 0, calls FinanceService.record_order_payment() then
        # _sync_payment() so the stored field is set from the ledger immediately.
        ...

    def post_to_baker(self, order: Order, by: User) -> Order: ...
    def advance_status(self, order: Order, to_status: str, by: User) -> Order: ...
    def dispatch_order(self, order: Order, driver: User, by: User) -> Order: ...
    def generate_tracking_id(self) -> str: ...

    def record_payment(self, order: Order, amount, method, by: User) -> Order:
        # 1. Writes FinancialTransaction (direction='in', type='order_payment').
        # 2. Calls _sync_payment() to recompute amount_paid + payment_status from ledger.
        # 3. Advances status PENDING → PAID if now fully paid.
        # Never uses += on amount_paid.
        ...

    def _sync_payment(self, order: Order) -> None:
        # Queries SUM(transactions WHERE direction='in') for this order,
        # stores the result in order.amount_paid, and derives payment_status.
        # Called after every transaction write — the only place amount_paid is set.
        ...

class OrderStateValidator(BaseService):
    """OCP: extend allowed transitions without modifying OrderService."""
    ALLOWED_TRANSITIONS = {
        'pending':    ['paid'],
        'paid':       ['baker'],
        'baker':      ['quality'],
        'quality':    ['decorator', 'ready'],     # ready if no custom cake; decorator for custom cakes only
        'decorator':  ['ready'],
        # 'packing' removed — future enhancement if a dedicated packing step is reintroduced
        'ready':      ['dispatched'],
        'dispatched': ['delivered'],
    }
    def validate(self, from_status: str, to_status: str): ...

# inventory/services.py
class InventoryService(BaseService):
    def record_stock_in(self, validated_data, added_by) -> StockEntry: ...
    def record_rollout(self, validated_data, by) -> DailyRollout: ...
    def get_low_stock_items(self) -> QuerySet: ...
    def update_item_quantity(self, item: InventoryItem, delta: Decimal): ...

# orders/services.py — ProductionService
class ProductionService(BaseService):
    def get_today_batches(self) -> QuerySet: ...
    # create_batch: validates rollout capacity with select_for_update(),
    # then creates DailyBatchItem + BatchIngredient rows atomically.
    def create_batch(self, validated_data, baked_by) -> DailyBatchItem: ...

# finance/services.py
class DebtService(BaseService):
    def sync_debt_from_order(self, order: Order): ...
    def record_payment(self, debt: DebtRecord, amount: Decimal, by: User): ...
    def recalculate_status(self, debt: DebtRecord): ...

class ReportService(BaseService):
    def daily_summary(self, date) -> dict: ...
    def revenue_by_period(self, start, end) -> list: ...
    def expense_breakdown(self, start, end) -> dict: ...
```

---

## 5. Role-Based Permissions (SOLID: ISP + LSP)

```python
# core/permissions.py
class IsRole(BasePermission):
    """Base: subclasses declare allowed_roles — no logic duplication."""
    allowed_roles: list[str] = []

    def has_permission(self, request, view):
        return request.user.role in self.allowed_roles

class IsManager(IsRole):
    allowed_roles = [Role.MANAGER]

class IsFrontDesk(IsRole):
    allowed_roles = [Role.FRONT_DESK]

class IsBaker(IsRole):
    allowed_roles = [Role.BAKER]

class IsInventoryClerk(IsRole):
    allowed_roles = [Role.INVENTORY_CLERK]

class IsDriver(IsRole):
    allowed_roles = [Role.DRIVER]

class IsManagerOrFrontDesk(IsRole):
    allowed_roles = [Role.MANAGER, Role.FRONT_DESK]

# Usage in views:
class OrderViewSet(ModelViewSet):
    def get_permissions(self):
        if self.action == 'create':
            return [IsManagerOrFrontDesk()]
        if self.action in ['post_to_baker', 'dispatch']:
            return [IsManagerOrFrontDesk()]
        if self.action in ['accept', 'quality_check']:
            return [IsBaker()]
        return [IsAuthenticated()]
```

---

## 6. API Endpoints

```
AUTH
  POST   /api/auth/token/                   login (returns access + refresh JWT)
  POST   /api/auth/token/refresh/           refresh access token
  POST   /api/auth/logout/                  blacklist refresh token

ORDERS
  GET    /api/orders/                        list (filter by status, date, role)
  POST   /api/orders/                        create
  GET    /api/orders/{id}/                   detail
  PATCH  /api/orders/{id}/                   partial update
  POST   /api/orders/{id}/post_to_baker/
  POST   /api/orders/{id}/quality_check/
  # POST /api/orders/{id}/mark_packing/  — future enhancement (packing step removed)
  POST   /api/orders/{id}/mark_ready/
  POST   /api/orders/{id}/dispatch/
  POST   /api/orders/{id}/mark_delivered/
  POST   /api/orders/{id}/record_payment/
  POST   /api/orders/{id}/upload_proof/      accepts multipart/form-data for proof_of_delivery ImageField
  GET    /api/orders/track/{tracking_id}/    PUBLIC — no auth required, returns tracking timeline data
  GET    /api/orders/summary/               pre-aggregated KPI totals (IsManager/IsFrontDesk)
                                            → { count, total_revenue, total_price,
                                                total_outstanding, by_status, by_payment_method }
                                            total_revenue comes from FinancialTransaction ledger,
                                            not from Order.amount_paid directly.

MENU ITEMS
  GET    /api/menu/                          list active menu items — includes stock_today (sum of today's DailyBatchItem.quantity_remaining per item)
  GET    /api/menu/categories/               ordered list of distinct category slugs e.g. ["cake","bread","pastry"]
  POST   /api/menu/                          create (manager only)
  PATCH  /api/menu/{id}/

CUSTOMERS
  GET    /api/customers/
  POST   /api/customers/
  GET    /api/customers/{id}/
  PATCH  /api/customers/{id}/

INVENTORY
  GET    /api/inventory/                     list with stock_health annotation
  POST   /api/inventory/                     create item
  GET    /api/inventory/{id}/
  PATCH  /api/inventory/{id}/
  GET    /api/inventory/low_stock/           items at or below min_stock
  POST   /api/inventory/stock_in/           create StockEntry + update quantity
  GET    /api/inventory/stock_entries/       filter by item, date
  POST   /api/inventory/rollout/            create DailyRollout + deduct quantity
  GET    /api/inventory/rollouts/            filter by date, item

PRODUCTION  (Baker)
  GET    /api/production/batches/            today's batches (prefetches ingredients) — IsBaker or IsAuthenticated
  POST   /api/production/batches/            IsBaker only — payload: { product_name, quantity_baked, notes?, ingredients: [{rollout_id, quantity_used}] }

SUPPLIERS
  GET    /api/suppliers/
  POST   /api/suppliers/
  PATCH  /api/suppliers/{id}/

FINANCE
  GET    /api/transactions/                  list — filter by direction, type, start, end (IsManager)
  POST   /api/transactions/                  create expense row only (IsManagerOrInventory)
                                             direction='out' is set server-side; clients never supply it
  GET    /api/transactions/summary/          pre-aggregated totals (IsManager)
                                             accepts same filters as list
                                             → { total, count, by_type: { order_payment, sale,
                                                 stock_expense, business_expense } }

STAFF  (Manager only)
  GET    /api/staff/
  POST   /api/staff/
  PATCH  /api/staff/{id}/
  POST   /api/staff/{id}/deactivate/

TASKS
  GET    /api/tasks/                         filter by role, status, assigned_to
  POST   /api/tasks/
  PATCH  /api/tasks/{id}/
  POST   /api/tasks/{id}/complete/

NOTIFICATIONS  (IsManagerOrFrontDesk)
  GET    /api/notifications/templates/      list templates
  POST   /api/notifications/templates/      create template
  PATCH  /api/notifications/templates/{id}/ update template
  DELETE /api/notifications/templates/{id}/ deactivate template (soft-delete)
  GET    /api/notifications/campaigns/      list sent campaigns
  POST   /api/notifications/campaigns/      send campaign (resolves {{vars}}, creates Campaign + NotificationLog rows)
  GET    /api/notifications/logs/           read-only per-recipient audit log
  POST   /api/orders/{id}/send_payment_reminder/  SMS reminder; self-heals stale payment_status if balance==0
  POST   /api/orders/{id}/send_overdue_notice/    SMS overdue notice; same self-heal guard

MESSAGING
  GET    /api/messages/
  POST   /api/messages/
  POST   /api/messages/bulk/

REPORTS  (Manager only)
  GET    /api/reports/daily/                 ?date=YYYY-MM-DD
  GET    /api/reports/revenue/               ?start=&end=
  GET    /api/reports/expenses/              ?start=&end=
  GET    /api/reports/debt_summary/
  GET    /api/reports/staff_performance/
```

---

## 7. Performance Strategy

### `amount_paid` — cached derived field pattern

`Order.amount_paid` is stored on the model for read performance but is **never written directly**. It is always derived by `_sync_payment()` after a transaction is written:

```
write transaction → _sync_payment() queries SUM(transactions) → stores result in Order.amount_paid
```

This gives O(1) reads with guaranteed correctness. The alternative (annotating every order query with a live `SUM JOIN`) was rejected because it added a transaction JOIN to every portal that fetches orders — including bakers and drivers who never display payment amounts.

**Rule:** never do `order.amount_paid += x`. Always call `_sync_payment()` after writing to `FinancialTransaction`.

---

### Database
- **`select_related` / `prefetch_related`** on every list endpoint — zero N+1 queries
  ```python
  Order.objects.select_related('customer', 'assigned_to', 'driver')
               .prefetch_related('items', 'status_history', 'payments')
  ```
- **Database indexes** on all filter fields: `status`, `tracking_id`, `pickup_date`, `payment_status`, `customer_id`, `date`
- **`annotate()`** for computed fields — single query, not Python loops
  ```python
  InventoryItem.objects.annotate(
      stock_health=ExpressionWrapper(
          F('quantity') / F('min_stock'),
          output_field=FloatField()
      )
  )
  ```
- **Pagination** enforced globally (default 25, max 100)
- **`only()`** on heavy list endpoints to fetch only required columns
- **`atomic()`** DB transactions for all multi-step writes (order + payment + debt sync)

### Caching (Redis)
```python
# Cache expensive, rarely-changing reads
@cache_page(60 * 5)   # 5 minutes
def menu_list(request): ...

# Per-role dashboard stats — short TTL
cache.set(f'dashboard:{user.role}:{today}', data, timeout=60)

# Invalidate low-stock cache on every StockEntry save
cache.delete('inventory:low_stock')
```

### Async / Background Jobs (Celery)
| Job | Trigger | Schedule |
|---|---|---|
| Debt status sync | Nightly | Cron: `0 0 * * *` |
| Recurring expense creation | On due date | Cron: `0 6 * * *` |
| Low-stock notifications | On `StockEntry` save | Signal → task |
| Delivery timeout alert | After dispatch | ETA: +X hours |

### Real-time (Django Channels + WebSocket)
Order status updates are pushed to connected portals on every transition. No polling needed.

```python
# Emit on every status transition in OrderService.advance_status()
async_to_sync(channel_layer.group_send)(
    f'role_{Role.BAKER}',
    {
        'type': 'order.status_changed',
        'order_id': str(order.id),
        'status': order.status,
    }
)
```

WebSocket consumer groups by role:
- `role_baker` — notified when orders are posted to baker queue
- `role_driver` — notified when a delivery is assigned
- `role_front_desk` — notified when orders are ready or delivered

---

## 8. Security

| Concern | Solution |
|---|---|
| Authentication | JWT — access token: 15 min, refresh token: 7 days |
| Token storage | **Option C** — access token in JS memory only; refresh token in HttpOnly SameSite=Strict cookie |
| Token rotation | `ROTATE_REFRESH_TOKENS = True` + `BLACKLIST_AFTER_ROTATION = True` (SimpleJWT) |
| Token blacklisting | `rest_framework_simplejwt.token_blacklist` app — logout endpoint must call `token.blacklist()` |
| Role enforcement | `IsRole` permission class on every endpoint, no exceptions |
| Object-level access | Bakers can only update orders assigned to them |
| Public endpoint | `/track/{tracking_id}` — rate-limited, returns minimal fields only |
| SQL injection | ORM only — raw queries in `ReportService` use parameterized SQL |
| CORS | `django-cors-headers` with explicit frontend origin whitelist |
| Rate limiting | `django-ratelimit` on login + public tracking endpoint; `django-axes` for brute-force lockout |
| Input validation | Serializer layer + service layer — no trust of client data |
| Audit trail | `OrderStatusHistory` records every transition with actor + timestamp |
| Secrets | All credentials in environment variables, never in code |
| Role-aware serializers | Sensitive fields (e.g. `salary`) stripped by role in `get_serializer_class()` |
| Production hardening | See production settings checklist in `API_INTEGRATION.md` |

### Token storage implementation (Option C)

The frontend stores the access token in a JS module variable only — never in `localStorage` or `sessionStorage`. The refresh token must be delivered as an HttpOnly cookie by Django, not in the JSON response body.

**Login response — required Django config:**

```python
# accounts/views.py — custom login view (or override SimpleJWT's TokenObtainPairView)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh = response.data.pop('refresh')   # remove from JSON body
            response.set_cookie(
                key='bakeflow_refresh',
                value=refresh,
                httponly=True,
                secure=True,           # HTTPS only
                samesite='Strict',
                max_age=7 * 24 * 3600, # 7 days, matches REFRESH_TOKEN_LIFETIME
                path='/api/auth/',     # cookie only sent to auth endpoints
            )
        return response
```

**Token refresh — reads from cookie, not request body:**

```python
# accounts/views.py
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('bakeflow_refresh')
        if not refresh_token:
            raise InvalidToken('No refresh token cookie')
        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # ROTATE_REFRESH_TOKENS is True — set the new refresh cookie
            new_refresh = response.data.pop('refresh')
            response.set_cookie(
                key='bakeflow_refresh',
                value=new_refresh,
                httponly=True,
                secure=True,
                samesite='Strict',
                max_age=7 * 24 * 3600,
                path='/api/auth/',
            )
        return response
```

**Logout — blacklists the token and clears the cookie:**

```python
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get('bakeflow_refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass  # already invalid — fine
        response = Response(status=204)
        response.delete_cookie('bakeflow_refresh', path='/api/auth/')
        return response
```

**SimpleJWT settings:**

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt.token_blacklist',  # run: python manage.py migrate
]
```

### Brute-force protection (django-axes)

```python
# pip install django-axes
INSTALLED_APPS = [..., 'axes']

AXES_FAILURE_LIMIT = 5          # lock after 5 consecutive failures
AXES_COOLOFF_TIME = 1           # unlock after 1 hour
AXES_RESET_ON_SUCCESS = True    # reset failure count on successful login
AXES_LOCKOUT_PARAMETERS = ['ip_address', 'username']  # lock by IP + username

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```

### Role-aware serializers (sensitive fields)

Some fields must be filtered by the requester's role. Never rely solely on endpoint-level permissions — use `get_serializer_class()`:

```python
# accounts/views.py
class StaffViewSet(ModelViewSet):
    def get_serializer_class(self):
        if self.request.user.role == Role.MANAGER:
            return StaffDetailSerializer   # includes salary, join_date, status
        return StaffPublicSerializer       # name, role, avatar_url only
```

Apply the same pattern anywhere the same endpoint serves multiple roles with different data needs (e.g. order detail for manager vs driver).

---

## 9. Implementation Phases

| Phase | Scope | Priority |
|---|---|---|
| **1** ✅ | Auth, custom User model, role permissions, JWT setup | Critical |
| **2** ✅ | Orders CRUD + state machine + payment recording + audit trail | Critical |
| **3** ✅ | Customer model + public tracking endpoint | Critical |
| **4** ✅ | Inventory: items, stock-in, rollouts, low-stock alerts, supplier CRUD | High |
| **5** | Finance: debts, expenses, payment history | High |
| **6** | Staff management + task assignment | Medium |
| **7** | Reports + dashboard aggregation endpoints | Medium |
| **8** | Messaging (internal + customer) | Medium |
| **9** | WebSocket real-time updates via Django Channels | Enhancement |
| **10** | Celery async jobs (debt sync, notifications, recurring expenses) | Enhancement |

---

## 10. Key SOLID Applications

| Principle | Where applied |
|---|---|
| **SRP** — Single Responsibility | Each app owns exactly one domain. Services own business logic. Views own HTTP only. Models own data shape only. |
| **OCP** — Open/Closed | `OrderStateValidator.ALLOWED_TRANSITIONS` — new statuses extend the dict without touching `OrderService`. Expense categories extend `TextChoices` without view changes. |
| **LSP** — Liskov Substitution | All `IsRole` subclasses are interchangeable in `get_permissions()`. Any `BaseService` subclass can be swapped in a view without breaking it. |
| **ISP** — Interface Segregation | Serializers split by action: `OrderListSerializer` (light, for lists), `OrderDetailSerializer` (full, for single fetch), `OrderCreateSerializer` (write fields only). Roles only receive permissions relevant to their portal. |
| **DIP** — Dependency Inversion | Views depend on service interfaces, not the ORM directly. Switching data sources (e.g., caching layer) means changing only the service internals. |

---

## Appendix: Order Status Flow

```
                     ┌──────────┐
                     │ PENDING  │  ← Order created by Front Desk
                     └────┬─────┘
                          │ payment recorded
                     ┌────▼─────┐
                     │   PAID   │
                     └────┬─────┘
                          │ posted to baker
                     ┌────▼─────┐
                     │  BAKER   │  ← Baker accepts & bakes
                     └────┬─────┘
                          │ quality check passed
                     ┌────▼─────┐
                     │ QUALITY  │
                     └────┬─────┘
                 ┌────────┴────────┐
        custom cake?             no custom cake
                 │                        │
          ┌──────▼──────┐                 │
          │  DECORATOR  │                 │
          └──────┬──────┘                 │
                 │ decoration done        │
                 └──────────┬─────────────┘
                       ┌────▼────┐
                       │  READY  │  ← Front Desk notified
                       └────┬────┘
                            │ dispatched
                     ┌──────▼──────┐
                     │ DISPATCHED  │  ← Driver assigned
                     └──────┬──────┘
                            │ driver confirms delivery
                     ┌──────▼──────┐
                     │  DELIVERED  │  ← Order complete
                     └─────────────┘

Note: PACKING status is retained in the DB schema as a future enhancement
but is no longer reachable through the normal order flow.
```

## Appendix: Role Access Matrix

| Endpoint Group | Manager | Front Desk | Baker | Decorator | Driver | Inventory |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Create orders | W | W | — | — | — | — |
| View orders | R | R | R | R | R | — |
| Advance order status | W | W | W | W | W | — |
| Record payment | W | W | — | — | — | — |
| Inventory item & supplier CRUD | W | — | — | — | — | W |
| Stock-in / rollout | — | — | — | — | — | W |
| Staff management | W | — | — | — | — | — |
| Debts & expenses | R/W | — | — | — | — | R |
| Reports | R | — | — | — | — | — |
| Tasks | W | — | R | R | R | R |
| Messaging | W | W | — | — | — | — |

Note: Packing role removed from active roles (2026-04-02). Packing column dropped from matrix.
Manager has write access to inventory item and supplier CRUD via `IsManagerOrInventory` permission (`core/permissions.py`). Stock-in and rollout operations remain inventory_clerk only — managers manage the catalogue, clerks manage stock movements.
`R` = read, `W` = read + write, `—` = no access

---

*Generated from frontend analysis on 2026-03-21. Update this document as the implementation evolves.*
