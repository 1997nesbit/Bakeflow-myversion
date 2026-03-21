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
│   ├── messaging/                 # Internal + customer messaging
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
    DECORATOR       = 'decorator'
    PACKING         = 'packing'
    DRIVER          = 'driver'
    INVENTORY_CLERK = 'inventory_clerk'

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
    PACKING    = 'packing'
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
    payment_status    = CharField(choices=PaymentStatus, default='unpaid')
    payment_method    = CharField(choices=[...], null=True)
    payment_terms     = CharField(choices=['upfront', 'on_delivery'])

    assigned_to       = ForeignKey(User, null=True, related_name='assigned_orders', on_delete=SET_NULL)
    posted_to_baker_at = DateTimeField(null=True)
    dispatched_at     = DateTimeField(null=True)
    driver            = ForeignKey(User, null=True, related_name='deliveries', on_delete=SET_NULL)
    driver_accepted   = BooleanField(null=True)
    driver_delivered  = BooleanField(default=False)

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
    """Baker's daily production log."""
    product_name       = CharField(max_length=200)
    category           = CharField(choices=['bread', 'pastry', 'snack', 'cake'])
    quantity_baked     = PositiveIntegerField()
    quantity_remaining = PositiveIntegerField()
    unit               = CharField(max_length=30)
    baked_by           = ForeignKey(User, on_delete=PROTECT)
    baked_at           = DateTimeField()
    oven_temp          = CharField(max_length=20, blank=True)
    notes              = TextField(blank=True)
```

### `finance` app

```python
class DebtRecord(TimestampedModel):
    id           = UUIDField(primary_key=True)
    order        = OneToOneField(Order, on_delete=PROTECT)
    customer     = ForeignKey(Customer, on_delete=PROTECT)
    total_amount = DecimalField(max_digits=12, decimal_places=2)
    amount_paid  = DecimalField(max_digits=12, decimal_places=2, default=0)
    due_date     = DateField()
    status       = CharField(choices=['overdue', 'pending', 'partial'])

    @property
    def balance(self):
        return self.total_amount - self.amount_paid

class Expense(TimestampedModel):
    id               = UUIDField(primary_key=True)
    title            = CharField(max_length=300)
    category         = CharField(choices=ExpenseCategory)
    expense_type     = CharField(choices=['stock', 'business'], db_index=True)
    amount           = DecimalField(max_digits=12, decimal_places=2)
    date             = DateField(db_index=True)
    paid_to          = CharField(max_length=200)
    payment_method   = CharField(choices=PaymentMethod)
    receipt_ref      = CharField(max_length=100, blank=True)
    notes            = TextField(blank=True)
    recurring        = BooleanField(default=False)
    recurring_period = CharField(choices=['weekly', 'monthly', 'yearly'], null=True)
    added_by         = ForeignKey(User, on_delete=PROTECT)

class Payment(TimestampedModel):
    """Each individual payment transaction against an order."""
    order          = ForeignKey(Order, related_name='payments', on_delete=PROTECT)
    amount         = DecimalField(max_digits=12, decimal_places=2)
    payment_method = CharField(choices=PaymentMethod)
    recorded_by    = ForeignKey(User, on_delete=PROTECT)
    note           = TextField(blank=True)
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
    def create_order(self, validated_data, created_by) -> Order: ...
    def post_to_baker(self, order: Order, by: User) -> Order: ...
    def assign_baker(self, order: Order, baker: User) -> Order: ...
    def advance_status(self, order: Order, to_status: str, by: User) -> Order: ...
    def record_payment(self, order: Order, amount, method, by: User) -> Order: ...
    def dispatch_order(self, order: Order, driver: User, by: User) -> Order: ...
    def generate_tracking_id(self) -> str: ...

class OrderStateValidator(BaseService):
    """OCP: extend allowed transitions without modifying OrderService."""
    ALLOWED_TRANSITIONS = {
        'pending':    ['paid'],
        'paid':       ['baker'],
        'baker':      ['quality'],
        'quality':    ['decorator', 'packing'],   # packing if no custom cake
        'decorator':  ['packing'],
        'packing':    ['ready'],
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
  POST   /api/orders/{id}/assign_baker/
  POST   /api/orders/{id}/quality_check/
  POST   /api/orders/{id}/mark_packing/
  POST   /api/orders/{id}/mark_ready/
  POST   /api/orders/{id}/dispatch/
  POST   /api/orders/{id}/mark_delivered/
  POST   /api/orders/{id}/record_payment/
  GET    /api/orders/track/{tracking_id}/   PUBLIC — no auth required

MENU ITEMS
  GET    /api/menu/                          list active menu items
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
  GET    /api/production/batches/
  POST   /api/production/batches/

SUPPLIERS
  GET    /api/suppliers/
  POST   /api/suppliers/
  PATCH  /api/suppliers/{id}/

FINANCE
  GET    /api/expenses/                      filter by type (stock/business), date range
  POST   /api/expenses/
  GET    /api/debts/                         filter by status (overdue/pending/partial)
  GET    /api/debts/{id}/
  POST   /api/debts/{id}/pay/
  GET    /api/payments/                      payment history

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
| Role enforcement | `IsRole` permission class on every endpoint, no exceptions |
| Object-level access | Bakers can only update orders assigned to them |
| Public endpoint | `/track/{tracking_id}` — rate-limited, returns minimal fields only |
| SQL injection | ORM only — raw queries in `ReportService` use parameterized SQL |
| CORS | `django-cors-headers` with explicit frontend origin whitelist |
| Rate limiting | `django-ratelimit` on login + public tracking endpoint |
| Input validation | Serializer layer + service layer — no trust of client data |
| Audit trail | `OrderStatusHistory` records every transition with actor + timestamp |
| Secrets | All credentials in environment variables, never in code |

---

## 9. Implementation Phases

| Phase | Scope | Priority |
|---|---|---|
| **1** | Auth, custom User model, role permissions, JWT setup | Critical |
| **2** | Orders CRUD + state machine + payment recording + audit trail | Critical |
| **3** | Customer model + public tracking endpoint | Critical |
| **4** | Inventory: items, stock-in, rollouts, low-stock alerts | High |
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
          ┌──────▼──────┐         ┌───────▼──────┐
          │  DECORATOR  │         │   PACKING    │
          └──────┬──────┘         └───────┬──────┘
                 │ decoration done         │
          ┌──────▼──────┐                 │
          │   PACKING   │─────────────────┘
          └──────┬──────┘
                 │ packed
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
```

## Appendix: Role Access Matrix

| Endpoint Group | Manager | Front Desk | Baker | Decorator | Packing | Driver | Inventory |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Create orders | W | W | — | — | — | — | — |
| View orders | R | R | R | R | R | R | — |
| Advance order status | W | W | W | W | W | W | — |
| Record payment | W | W | — | — | — | — | — |
| Inventory CRUD | R | — | — | — | — | — | W |
| Staff management | W | — | — | — | — | — | — |
| Debts & expenses | R/W | — | — | — | — | — | R |
| Reports | R | — | — | — | — | — | — |
| Tasks | W | — | R | R | R | R | R |
| Messaging | W | W | — | — | — | — | — |

`R` = read, `W` = read + write, `—` = no access

---

*Generated from frontend analysis on 2026-03-21. Update this document as the implementation evolves.*
