# Bakeflow — Implementation Progress

Last updated: 2026-04-20 (Phase 8 Polish: SMS status UI, payment status integrity fixes, inline send feedback, custom deposit amounts)

---

## Phase 1 — Authentication ✅ COMPLETE

### Backend (`backend/`)

- Django 6 project scaffolded inside `backend/` (split settings: base / development / production)
- PostgreSQL connected via `django-environ` — DB: `bakeflow_dev`
- `apps/accounts` — custom `User` model (UUID PK, email login, 5 roles — see decision below)
- `CustomTokenObtainPairSerializer` — accepts `{ username, password }` where username = email or phone; adds `role` + `name` to JWT payload
- `LoginView` — returns `{ access }` in body, moves refresh token to HttpOnly `bakeflow_refresh` cookie
- `CookieTokenRefreshView` — reads refresh from cookie, rotates it
- `LogoutView` — blacklists token, clears cookie
- `MeView` — returns `{ id, name, role, email, phone, avatar_url }`
- `core/permissions.py` — `IsRole` hierarchy: `IsManager`, `IsFrontDesk`, `IsBaker`, `IsDriver`, `IsInventoryClerk`, `IsManagerOrFrontDesk`, `IsManagerOrInventory`
- `core/pagination.py` — `StandardPagination` (25 / max 100)
- `core/exceptions.py` — custom DRF exception handler (no tracebacks in responses)
- `django-axes` — brute-force lockout: 5 failures → 1 hour lockout, tracks by IP + username
- Django admin — custom `UserAdmin` with email-based creation form
- `create_dev_superuser` management command — idempotent, reads from `.env`, only runs when `DEBUG=True`
- `start.sh` — chains `migrate → create_dev_superuser → runserver`
- Initial migration generated and applied

### Frontend (`src/`)

- `axios` + `jwt-decode` installed
- `src/lib/api/client.ts` — activated: in-memory access token, proactive refresh (1 min before expiry), reactive 401 interceptor
- `src/lib/api/services/auth.ts` — real `apiClient` calls: login / logout / getMe
- `src/lib/hooks/use-portal-login.ts` — replaced demo `setTimeout` with `authService.login()`; errors surface via `handleApiError`
- `src/lib/hooks/use-role-auth.ts` — replaced localStorage with `jwtDecode` + role validation; `storageKey` option removed
- `src/lib/hooks/use-manager-auth.ts` — updated to new `expectedRole` API
- `src/components/shared/AuthBootstrap.tsx` — client component that calls `initAuth()` on app load
- `src/app/layout.tsx` — mounts `<AuthBootstrap />` for silent session restore on page refresh
- `src/components/shared/PortalLoginForm.tsx` — stripped demo credential props; only `redirectPath` needed
- All portal login components updated — `BakerLogin`, `FrontDeskLogin`, `InventoryLogin`, `ManagerLogin`
- `PortalSidebar` — all `authConfig` objects updated from `storageKey` to `expectedRole`
- `.env.local` created — `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

### Design decisions made during Phase 1

- **`decorator` and `packing` roles removed from `User.Role`** — the user simplified the role set to 5: `manager`, `front_desk`, `baker`, `driver`, `inventory_clerk`. These portals still exist in the frontend but their staff will be managed under another role. Requires a new migration if roles are added back.
- **Login accepts `username` field (not `email`)** — frontend sends `{ username, password }`; backend looks up by email first, then phone. This avoids changing the frontend form label.
- **`AuthBootstrap` component** — chosen over making `RootLayout` a client component. Keeps the layout as a server component; only the bootstrap shim is client-side.

---

## Phase 2 — Orders & Production ✅ COMPLETE

### Backend (`backend/`)

- `core/models.py` — `TimestampedModel` abstract base (auto `created_at` / `updated_at`)
- `apps/customers/models.py` — `Customer` (UUID PK, phone unique, `is_gold`, denormalized counters)
- `apps/orders/models.py` — `Order`, `OrderItem`, `OrderStatusHistory`, `MenuItem`, `DailyBatchItem` (all TextChoices enums defined)
- `apps/orders/services.py` — `OrderStateValidator` (allowed transitions map, OCP), `OrderService`, `ProductionService`
- `apps/orders/serializers.py` — `CustomerInlineSerializer`, `OrderListSerializer`, `OrderDetailSerializer`, `OrderCreateSerializer`, payment/dispatch serializers, batch serializers
- `apps/orders/views.py` — `OrderViewSet` with all state-transition actions (`post_to_baker`, `accept`, `quality_check`, `mark_ready`, `dispatch`, `mark_delivered`, `record_payment`); `dispatch_order` rejects orders where `payment_status != 'paid'` (HTTP 400); `mark_packing` commented out (future enhancement)
- `apps/orders/urls.py` — registered: `/api/orders/`, `/api/menu/`, `/api/production/batches/`
- `djangorestframework-camel-case` installed — auto-converts snake_case ↔ camelCase; no field renames needed in frontend
- Migrations generated and applied for `customers` and `orders` apps

### Frontend (`src/`)

- `src/lib/api/services/orders.ts` — fully activated; all order actions + `productionService` (including `uploadProof`)
- `src/types/order.ts` — `Order` now uses nested `customer: OrderCustomer` object; `NewOrderData` keeps flat fields for creation form; `OrderTrackingResponse` added for public track page.
- All portal components updated to use real API calls with AbortController pattern:
  - `BakerActive`, `BakerDashboard`, `BakerHistory`, `BakerProduction`
  - `FrontDeskOrders`, `FrontDeskDashboard`, `FrontDeskSearch`, `FrontDeskMessaging`
  - `DriverDashboard` (now using `uploadProof` with image preview modal and filtered orders via `views.py`), `PackingDashboard` (portal retained as future enhancement), `DecoratorDashboard`
  - `ManagerDashboard`, `ManagerOrderHistory`, `ManagerPayments`, `ManagerReports`
  - `OrderTracking` (public) — now fetches from `/api/orders/track/{id}/` and renders an animated UI tracker via `OrderTracker.tsx`.
- All subcomponents updated to use `order.customer.name` / `order.customer.phone` / `order.customer.isGold`
- `OrderForm` — removed `generateTrackingId` (backend generates tracking IDs); removed tracking link preview from step 3
- `src/data/mock/orders.ts`, `production.ts`, `helpers.ts` — deleted
- `src/data/mock/index.ts` — Phase 2 exports removed

### Design decisions made during Phase 2

- **`djangorestframework-camel-case`** — installed to keep the frontend fully camelCase without renaming 36+ component references
- **Customer model in Phase 2** — `Order` FK to `Customer` required the model; the full Customer API endpoints are Phase 3
- **`DailyBatchItem` temporarily in `orders` app** — will move to `inventory` app in Phase 4
- **Baker incoming/baking discriminator** — changed from `!postedToBakerAt` to `!assignedTo` (all baker-queue orders have `postedToBakerAt` set by front desk)
- **`isGoldCustomer` removed from `NewOrderData`** — gold status is managed on the Customer record, not set at order creation

---

---

## Menu Management UI — ✅ COMPLETE (2026-04-03)

Standalone UI feature built ahead of Phase 4 backend activation. The page is live and fully functional using local state seeded from the existing `bakeryMenu` constant. Write operations will be wired to the API when Phase 4 CRUD endpoints are available.

### Accessible from
- Manager portal: `/manager/menu` (dark theme, `ManagerSidebar`)
- Front Desk portal: `/front-desk/menu` (light theme, `FrontDeskSidebar`)
- Both portals have full add / edit / delete access — no role restriction on the UI.

### What was built

**New files:**
- `src/components/shared/MenuManagement.tsx` — cross-portal page component; takes `sidebar: ReactNode` and `theme: 'light' | 'dark'` props; owns all state
- `src/components/shared/MenuItemFormDialog.tsx` — reusable add/edit dialog; receives `onSave(data, id?)` callback; handles its own form state and validation
- `src/components/portals/manager/ManagerMenu.tsx` — thin wrapper: injects `<ManagerSidebar />` + `theme="dark"`
- `src/components/portals/front-desk/FrontDeskMenu.tsx` — thin wrapper: injects `<FrontDeskSidebar />` + `theme="light"`
- `src/app/(dashboard)/manager/menu/page.tsx` — 4-line shell
- `src/app/(dashboard)/front-desk/menu/page.tsx` — 4-line shell

**Modified files:**
- `src/types/order.ts` — added `isAvailable?: boolean` to `MenuItem`
- `src/lib/api/services/menu.ts` — extended with `createItem`, `updateItem`, `deleteItem`, `createCategory`, `renameCategory`, `deleteCategory` stubs (all throw until Phase 4 ext)
- `src/lib/api/index.ts` — exports `menuService`
- `src/components/layout/sidebar/PortalSidebar.tsx` — added `Menu` nav entry (icon: `UtensilsCrossed`) to both `managerNav` and `frontDeskNav`

### Features

**Menu Items tab**
- Filter chips by category (counts reflect the full unfiltered set; not affected by search)
- Search bar — filters by item name and description; `useMemo` ensures the filter only recomputes when `items`, `filterCat`, or `search` changes; clear button resets query
- Responsive grid of item cards (name, category badge, price, estimated minutes, description)
- Add Item → `MenuItemFormDialog` (name, category select or new inline, price, est. minutes, description)
- Edit Item → same dialog pre-filled
- Delete Item → confirm dialog before removal

**Item Types tab**
- Lists all categories with per-category item counts
- Rename category → renames all items using it atomically in local state
- Delete category → blocked with a toast if any items still use it
- Add Category → creates an empty category (available immediately in the item form's category dropdown)

### Design decisions

- **Shared component in `shared/`** — the page logic is identical between both portals; only the sidebar differs. Using a `sidebar` prop keeps the component genuinely generic, analogous to `PortalLoginForm`.
- **Local state seeded from constant** — `bakeryMenu` from `src/data/constants/menus.ts` is used as `useState` initial value. This is not mock retirement; the constant remains and is still used by order forms. The management page builds its own working copy.
- **Category state** — categories are derived from items (`uniqueSorted`) plus an `emptyCats: string[]` list for categories added before any items exist. Rename and delete cascade through both lists atomically.
- **`useMemo` on `filtered`** — avoids rerunning the name/description string scan on every render; only re-evaluates when `items`, `filterCat`, or `search` changes.

### What's deferred (Phase 4 extension)

The service stubs (`createItem`, `updateItem`, `deleteItem`, `createCategory`, `renameCategory`, `deleteCategory`) need corresponding Django endpoints before they can be activated. When ready, replace the `MenuManagement` `useState(bakeryMenu)` initializer with a `useEffect` fetch from `menuService.getItems()` and wire each mutation handler to the appropriate service call instead of updating local state directly. The component interface does not need to change.

---

## Phase 3 — Customers & Staff ✅ COMPLETE (2026-04-03)

### Backend (`backend/`)

- `apps/customers/models.py` — `Customer` (UUID PK, phone unique, `is_gold`, `total_orders`/`total_spent`/`last_order_date` denormalized counters) — scaffolded in Phase 2, first exposed via API here
- `apps/customers/serializers.py` — `CustomerSerializer` (all fields; `total_orders`, `total_spent`, `last_order_date` read-only)
- `apps/customers/views.py` — `CustomerViewSet`: list/create/partial_update, search by name/phone/email, filter by `is_gold`, ordering by name/total_spent/last_order_date
- `apps/customers/urls.py` — registered at `/api/customers/`
- `apps/accounts/serializers.py` — `StaffPublicSerializer` (id, name, role, avatar_url — no salary), `StaffDetailSerializer` (adds email, phone, status, salary, join_date)
- `apps/accounts/views.py` — `StaffViewSet.get_serializer_class()` returns `StaffDetailSerializer` for `manager` role, `StaffPublicSerializer` for all other roles

### Frontend (`src/`)

- `src/lib/api/services/customers.ts` — activated: `getAll` (PaginatedResponse + AbortController), `getById`, `create`, `update`
- `src/lib/api/services/staff.ts` — activated: `getAll` (PaginatedResponse + AbortController), `create`, `update`, `deactivate`
- `src/components/portals/manager/ManagerCustomers.tsx` — real API fetch; `toggleGold` uses optimistic update with rollback on error
- `src/components/portals/manager/ManagerUsers.tsx` — real API fetch; `handleAdd`, `handleEdit`, `handleToggleStatus` all call service with error rollback
- `src/components/portals/manager/ManagerDashboard.tsx` — added staff + customer `useEffect` fetches; removed mock imports
- `src/components/portals/manager/ManagerReports.tsx` — staff + customer data fetched via service; `staffByRole` and customer counts derived from API results
- `src/components/portals/manager/ManagerTasks.tsx` — staff fetched for "Assign To" dropdown
- `src/components/portals/manager/ManagerMessages.tsx` — customers + staff fetched for audience counts in bulk message composer
- `src/components/public/OrderTracking.tsx` — removed `'use client'`, `useParams`, `useEffect`; refactored to accept `{ initialOrder, trackingId }` props (pure render)
- `src/app/track/[id]/page.tsx` — converted to async Server Component; fetches order server-side via `ordersService.getByTrackingId()`; adds `generateMetadata` for SEO title
- `src/data/mock/customers.ts`, `src/data/mock/staff.ts` — deleted
- `src/data/mock/index.ts` — Phase 3 exports removed

### Design decisions made during Phase 3

- **Tracking page as Server Component** — `/track/[id]` is the only public, SEO-indexable page; server-fetching avoids a loading flash and makes the HTML crawlable without JS
- **`StaffPublicSerializer` excludes salary** — non-manager roles calling `GET /api/staff/` receive name, role, and avatar only; salary is a manager-only field enforced at the serializer level, not just the endpoint level

---

## Phase 4 — Menu CRUD ✅ COMPLETE (2026-04-03)

### Backend (`backend/`)

- `apps/orders/models.py` — `MenuItem.category` changed from hardcoded choices to a free-form `CharField(max_length=50)`; enables dynamic categories from the UI
- `apps/orders/views.py` — `MenuViewSet` extended:
  - `destroy` action added (soft-delete: sets `is_active=False`)
  - `categories` action extended to handle `POST` (validate name, return slug)
  - `category_detail` action added (`PATCH` = rename all items, `DELETE` = reject if items exist, 204 if empty)
  - Permissions changed from `IsManager` → `IsManagerOrFrontDesk` on all write actions
- Migration generated and applied: `0002_menu_category_freeform`

### Frontend (`src/`)

- `src/types/order.ts` — `MenuItem.isAvailable` renamed to `isActive` (matches backend `is_active` → `isActive` via camel-case middleware)
- `src/lib/api/services/menu.ts` — all 6 write stubs activated: `createItem`, `updateItem`, `deleteItem`, `createCategory`, `renameCategory`, `deleteCategory`
- `src/components/shared/MenuManagement.tsx` — fully API-driven:
  - `useState(bakeryMenu)` replaced with `useEffect` fetching both `getItems()` and `getCategories()` in parallel
  - All mutation handlers (`handleSaveItem`, `handleDeleteItem`, `handleAddCat`, `handleRenameCat`, `handleDeleteCat`) now `async` and call the service with `try/catch → handleApiError`
  - `emptyCats` state removed; categories are server-managed
  - `loading` state added

### Design decisions

- **Free-form categories** — `MenuItem.category` is now a plain string (no DB enum constraint). The `GET /api/menu/categories/` action returns `DISTINCT` values from active items. `POST /api/menu/categories/` validates the slug and returns it; no separate `Category` model needed for MVP.
- **Soft-delete** — `DELETE /api/menu/{id}/` sets `is_active=False` rather than removing the row. The list queryset already filters `is_active=True` so deleted items are invisible to the frontend.

---

## Quick Sale feature ✅ COMPLETE (2026-04-03)

Walk-in point-of-sale transactions that bypass the full order pipeline. A customer walks in, picks items, pays, and leaves — no customer record, no tracking ID, no baker assignment.

### Backend (`backend/`)

- `apps/orders/models.py` — `Sale` (`TimestampedModel`, UUID PK, `total_price`, `payment_method`, `customer_name` blank-optional plain text, `served_by` FK → User) and `SaleItem` (`sale` FK, `name`, `quantity`, `unit_price`)
- `apps/orders/migrations/0003_sale_saleitem.py` — migration generated manually; apply with `python manage.py migrate`
- `apps/orders/serializers.py` — `SaleItemSerializer`, `SaleSerializer` (read; includes nested items + `served_by.name`), `SaleCreateSerializer` (write; validates items non-empty)
- `apps/orders/views.py` — `SaleViewSet`: `list` + `create`; `IsManagerOrFrontDesk` on both; `create` calls `Sale.objects.create()` then `SaleItem.objects.bulk_create()`
- `apps/orders/urls.py` — registered at `/api/sales/`

### Frontend (`src/`)

- `src/types/sale.ts` — `Sale`, `SaleItem`, `NewSaleData` interfaces
- `src/types/index.ts` — re-exports `sale.ts`
- `src/lib/api/services/sales.ts` — `salesService.create()` → `POST /api/sales/`
- `src/components/portals/front-desk/orders/MenuOrderStep.tsx` — Quick Sale toggle in the sticky cart panel; when ON: payment method pills (Cash / Card / Mobile / Bank) + "Sell Now — TZS X" button replace "Next: Customer Details"; steps 2 and 3 are never reached
- `src/components/portals/front-desk/orders/NewOrderPage.tsx` — `handleQuickSale()` calls `salesService.create()` and redirects to `/front-desk/orders` on success

### Design decisions

- **Separate `Sale` model, not a flag on `Order`** — a walk-in has no pickup date, no delivery type, no customer FK, no status lifecycle, no baker pipeline. Forcing it into `Order` would require ~10 nullable fields and branching logic throughout the pipeline. `Sale` is a minimal 5-field record.
- **Quick Sale only in the menu flow** — the toggle appears only in `MenuOrderStep`. The custom cake flow is always an advance order and never a walk-in.
- **Always paid in full** — no deposit or "save unpaid" option. A sale at the counter is always settled immediately.
- **Optional plain-text `customer_name`** — no FK to `Customer`; just a name for receipt reference if needed. No customer record is created or updated.

---

## `bakeryMenu` static data removed (2026-04-03)

The static `bakeryMenu` array in `src/data/constants/menus.ts` was the last piece of hardcoded menu data. It has been fully removed from the order flow.

- `src/data/constants/menus.ts` — `bakeryMenu` array and its `MenuItem` import deleted. `cakeFlavours` and `icingTypes` remain (permanent UI constants for the custom cake form).
- `src/components/portals/front-desk/orders/NewOrderPage.tsx` — `useState<MenuItem[]>([])` with no fallback; fetches directly from `menuService.getItems()` and `menuService.getCategories()` on mount.
- `src/components/portals/baker/production/AddBatchForm.tsx` — quick-select chip section removed. Product name is a plain text input.

---

## Packing step removed from order flow (2026-04-03)

The packing status and its associated portal exist in the codebase but are no longer reachable through the normal order pipeline. `quality → ready` (menu orders) and `decorator → ready` (custom cakes) are now the active transitions.

**What was changed:**
- `OrderStateValidator.ALLOWED_TRANSITIONS` — `quality` now routes to `[decorator, ready]`; `packing` removed as intermediate step
- `OrderStatus.PACKING` — commented out in `models.py` (value retained in DB for historical rows)
- `mark_packing` view action — commented out in `views.py`
- `packing` role filter — commented out in `OrderViewSet.list()`
- `BakerActive.handleQAPass` — non-custom orders now call `ordersService.markReady()` instead of `markPacking()`
- `QAOrderCard` — Pass button label now shows "Pass → Ready" for menu orders

**What was NOT changed:** The `packing` DB column value, the `PackingDashboard` frontend portal, and `src/app/(dashboard)/packing/` route are all still present — ready to be reactivated if the packing step is reintroduced.

---

## Phase 4 — Inventory ✅ COMPLETE (2026-04-03)

### Backend (`backend/`)

- `apps/inventory/` — new Django app created and registered in `INSTALLED_APPS`
- `apps/inventory/models.py` — `Supplier`, `SupplierProduct`, `InventoryItem`, `StockEntry`, `DailyRollout` (note: `DailyBatchItem` remains in `apps/orders` where it was already live from Phase 2)
- `apps/inventory/services.py` — `InventoryService`: `record_stock_in()` and `record_rollout()` both wrapped in `atomic()`; quantity updated via `F()` expressions to prevent race conditions; rollout validates against current stock before writing
- `apps/inventory/serializers.py` — `InventoryItemSerializer` (includes `stock_health` as annotated `FloatField`; `supplier_id` write-only FK), `StockEntrySerializer` / `StockEntryWriteSerializer`, `DailyRolloutSerializer` / `DailyRolloutWriteSerializer`, `SupplierSerializer` / `SupplierWriteSerializer`
- `apps/inventory/views.py` — `InventoryViewSet` (list, retrieve, create, partial_update + custom actions: `low_stock`, `stock_entries`, `stock_in`, `rollouts`, `rollout`), `SupplierViewSet` (list, retrieve, create, partial_update); write actions use `IsManagerOrInventory` permission
- `apps/inventory/urls.py` — registered at `/api/inventory/` and `/api/suppliers/`
- `config/urls.py` — `apps/inventory.urls` included at `/api/`
- Migrations pending: run `python manage.py makemigrations inventory && python manage.py migrate`

### Frontend (`src/`)

- `src/types/inventory.ts` — updated to match backend: `supplierId` replaced with `supplier: SupplierInline | null`; `stockHealth: number` added; `itemUnit` / `addedByName` / `rolledOutByName` fields added; `StockEntryPayload`, `DailyRolloutPayload`, `InventoryItemPayload`, `SupplierPayload` write types added
- `src/lib/api/services/inventory.ts` — fully activated: `getAll`, `getLowStock`, `getStockEntries`, `recordStockIn`, `getRollouts`, `recordRollout`, `getSuppliers`, `createItem`, `updateItem`, `createSupplier`, `updateSupplier`
- `InventoryDashboard` — 4 parallel fetches (inventory, stock entries, today's rollouts, suppliers) with shared AbortController
- `InventoryStockIn` + `AddStockDialog` — `handleAddStock` async, calls `recordStockIn`; suppliers passed as prop (no mock); Sonner toasts
- `InventoryAlerts` — service fetch; `handleQuickRestock` calls `recordStockIn` then refetches; supplier lookup via `item.supplier`; Sonner toasts
- `InventoryRollout` — service fetch; `handleRollout` async, calls `recordRollout`; hardcoded date removed; `rolledOutBy` free-text field removed (set server-side from `request.user`); Sonner toasts
- `StockEntriesTable` — field names updated (`itemUnit`, `addedByName`)
- `src/data/mock/inventory.ts` — deleted

### Manager Inventory Management page (new feature, Phase 4)

- `src/components/portals/manager/ManagerInventory.tsx` — manager-only page: Items tab (table with Health badge, edit button) + Suppliers tab; follows manager dark design language (`bg-manager-bg`, `text-white`, `border-white/10`, etc.)
- `src/components/portals/manager/inventory/ItemFormDialog.tsx` — create/edit dialog for inventory items (name, category, unit, quantity, min stock, cost/unit, supplier)
- `src/components/portals/manager/inventory/SupplierFormDialog.tsx` — create/edit dialog for suppliers (name, phone, email)
- `src/app/(dashboard)/manager/inventory/page.tsx` — 4-line route shell
- `src/components/layout/sidebar/PortalSidebar.tsx` — "Inventory" (`Boxes` icon) added to `managerNav` between Menu and Order History

### Design decisions

- **`DailyBatchItem` stays in `apps/orders`** — it already had a migration and live endpoints from Phase 2; moving it would require a destructive migration with no benefit
- **`rolledOutBy` removed from rollout form** — set from `request.user` server-side; no risk of clerk logging a rollout under another name
- **`stock_health` annotated in DB** — computed via `ExpressionWrapper(F('quantity') / F('min_stock'))` in the queryset; no Python-level property calls per item
- **Manager can create/edit items and suppliers** — `IsManagerOrInventory` permission; stock-in and rollout remain inventory_clerk only

---

## Phase 5 — Finance & Payments ✅ COMPLETE (2026-04-03)

### Backend (`backend/`)

- `apps/finance/` — new Django app created and registered in `INSTALLED_APPS`
- `apps/finance/models.py` — `FinancialTransaction` (`TimestampedModel`, UUID PK, `direction` in/out, `type` discriminator, `payment_method`, `description`, `recorded_by` FK, optional `order`/`sale` FKs, expense-only fields: `category`, `paid_to`, `receipt_ref`, `notes`, `recurring`, `recurring_period`)
- `apps/finance/services.py` — `FinanceService`: `record_order_payment()` and `record_sale()` static methods; called as side effects from `OrderService.record_payment()` and `SaleViewSet.create()`
- `apps/finance/serializers.py` — `FinancialTransactionSerializer` (read), `ExpenseCreateSerializer` (write; validates `type` is `stock_expense`|`business_expense`; sets `direction='out'`)
- `apps/finance/views.py` — `FinancialTransactionViewSet`: `list` (`IsManager`) + `create` (`IsManagerOrInventory`)
- `apps/finance/urls.py` — registered at `/api/transactions/`
- Migrations: run `python manage.py makemigrations finance && python manage.py migrate`

### Frontend (`src/`)

- `src/types/finance.ts` — `Expense` and `BusinessExpense` removed; replaced with `FinancialTransaction`, `NewExpensePayload`, `TransactionDirection`, `TransactionType`, `RecurringPeriod`; `DebtRecord` retained for deferred debts feature
- `src/data/constants/categories.ts` — `ExpenseCategory` and `BusinessExpenseCategory` type aliases moved here (were in `finance.ts`)
- `src/lib/api/services/finance.ts` — fully activated: `getTransactions(params)` → `GET /api/transactions/`; `createExpense(payload)` → `POST /api/transactions/`
- `InventoryExpenses` — `useEffect` fetch with AbortController; `handleAddExpense` calls `financeService.createExpense()`; month summaries use dynamic current/last month prefixes
- `ManagerAccounts` — same pattern for `business_expense` type
- `ManagerReports` — `stockExpenses` and `bizExpenses` fetched via `financeService`; chart data derived from live data; `mockDebts` retained for `totalDebt` until debts phase
- `AddExpenseDialog` — emits `NewExpensePayload` (not a constructed `Expense`); `expenseCount` prop removed
- `src/data/mock/finance.ts` — `mockExpenses` and `mockBusinessExpenses` deleted; `mockDebts` retained

### Manager portal — Transactions sidebar section

- `PortalSidebar` — `NavItem` now supports `children?: NavChild[]`; when present the item renders as a `NavGroup` collapsible (chevron, auto-opens if a child is active, indented sub-items with a left border line)
- `managerNav` — `Account Management → /manager/accounts` replaced with a `Transactions` group containing two children:
  - `Revenue → /manager/revenue` — all `direction: 'in'` transactions; summary cards for Total Revenue, Order Payments, Walk-in Sales; filter by type + search
  - `Expenses → /manager/expenses` — all `direction: 'out'` transactions; summary cards for Total, Business, Stock; filter by type + category (category list adapts to selected type); inline Record Expense dialog with Business/Stock toggle
- `ManagerRevenue` — new component at `src/components/portals/manager/ManagerRevenue.tsx`
- `ManagerAccounts` — fully overwritten to become the Expenses page (previously business-expense only; now shows all expense types with unified filter + add dialog)
- `src/app/(dashboard)/manager/revenue/page.tsx` — new 4-line shell
- `src/app/(dashboard)/manager/expenses/page.tsx` — new 4-line shell
- `src/app/(dashboard)/manager/accounts/page.tsx` — now redirects to `/manager/expenses` (old URL preserved, no 404)

### Design decisions

- **Unified ledger over separate models** — a single `FinancialTransaction` table covers all money flows; revenue rows are created as service-layer side effects (never via the API directly); expense rows are created via `POST /api/transactions/`
- **`direction='out'` enforced server-side** — `ExpenseCreateSerializer.validate()` sets it; clients cannot create revenue rows through the API
- **Collapsible nav groups in `PortalSidebar`** — `NavItem.href` is now optional; items with `children` render as groups, items with `href` render as links; the type change is backward-compatible — all existing nav arrays are unaffected
- **`DebtRecord` deferred** — the model and UI exist but remain on mock data; no backend `DebtRecord` model created in this phase

---

## Inventory portal restructure (2026-04-04)

### Removed

- `InventoryExpenses` page and all sub-components (`ManagerPINGate`, `ExpenseSummaryCards`, `CategoryBreakdown`, `ExpenseFiltersBar`, `AddExpenseDialog`) — stock expense logging is now handled by the manager's Expenses page (`/manager/expenses`)
- `InventoryAlerts` page — alerts and reorder functionality merged into the new Stock page
- Routes deleted: `/inventory/expenses`, `/inventory/alerts`
- Sidebar entries removed: "Alerts & Reorder", "Expenses"

### Added

- `InventoryStock` (`src/components/portals/inventory/InventoryStock.tsx`) — unified stock status and reorder page
  - Three tabs: **All** · **Low** · **Critical** — each with a live count badge
  - Per-item: health bar, health badge (Healthy/Low/Critical), quantity vs min stock, cost/unit, supplier name
  - Per-item actions: Quick Add (fires `recordStockIn` with suggested fill-to-double-min quantity), Call supplier link, Reorder email link (marks sent in local state)
  - Search by name + category filter — persist across tab switches
- `/inventory/stock` route — 4-line shell
- Sidebar entry: "Stock" (`Package` icon) — replaces both removed entries
- `CriticalStockAlert` (dashboard sub-component) — link updated from `/inventory/alerts` to `/inventory/stock?tab=critical`

### Design decisions

- **Single page for status + alerts** — the clerk's job is to know what's on hand and act on low stock; having a separate Alerts page just added a navigation step with no new information
- **Quick Add fills to 2× min stock** — a consistent heuristic; the clerk can always do a full stock-in entry for a precise quantity
- **Reorder email is a mailto link** — no backend integration needed; opens the clerk's email client with a pre-filled subject and body. Marked "Sent" in local state for the session only

## Manager portal — Inventory nav + Daily Rollout (2026-04-04)

### Added

- `ManagerRollout` (`src/components/portals/manager/ManagerRollout.tsx`) — read-only rollout timeline view using the manager dark theme; fetches today's rollouts and inventory via `inventoryService`; allows recording new rollouts via the same dialog pattern as `InventoryRollout`
- `/manager/rollout` route — 4-line shell → `<ManagerRollout />`

### Changed

- `managerNav` in `PortalSidebar.tsx` — `Inventory` single link converted to a collapsible group with two children:
  - `Items & Suppliers → /manager/inventory` (`Package` icon)
  - `Daily Rollout → /manager/rollout` (`ScrollText` icon)
- `ManagerDashboard` — "View all" link changed from `/manager/payments` → `/manager/revenue`
- `CreditCard` icon import removed from `PortalSidebar.tsx` (unused after Payments removal)

### Removed

- `ManagerPayments.tsx` — component deleted (transactions data now in `/manager/revenue`)
- `/manager/payments` route — folder deleted

### Design decisions

- **Daily Rollout in manager portal** — managers need visibility into what stock has been issued to production; the inventory clerk page uses the same data via the same service, so the component is a thin dark-themed copy
- **Payments page removed** — the Revenue page (`/manager/revenue`) already shows all `direction: 'in'` transactions including order payments; a separate Payments page was redundant

---

## Phase 6 — Tasks ⬜ NOT STARTED

**Backend:** `apps/tasks`

**Frontend:** Activate `tasksService`. Delete `src/data/mock/tasks.ts`.

---

## Phase 7 — Reports ⬜ NOT STARTED

**Backend:** `apps/reports`

**Frontend:** Activate `reportsService`.

---

## Phase 8 — Customer Messaging ✅ COMPLETE (2026-04-18)

### Backend (`backend/`)

- `apps/notifications/` — new Django app, registered in `INSTALLED_APPS`
- `apps/notifications/models.py` — `MessageTemplate` (`{{variable}}` syntax, `trigger_event` choices, `is_automated`, `is_active`), `Campaign` (template FK, `recipients` JSONField, `message_content`, `sent_at`), `NotificationLog` (per-recipient status rows)
- `apps/notifications/services.py` — `NotificationService.send_campaign()` resolves variables, creates `Campaign` + `NotificationLog` rows, calls `_send_via_gateway()` stub (Briq.tz integration point)
- `apps/notifications/views.py` — `MessageTemplateViewSet` (CRUD), `CampaignViewSet` (list + send), `NotificationLogViewSet` (read-only); all `IsManagerOrFrontDesk`
- `apps/notifications/urls.py` — registered at `/api/notifications/`
- `apps/orders/views.py` — `dispatch_order` rejects HTTP 400 if `payment_status != 'paid'`
- `apps/orders/serializers.py` — `proof_of_delivery` removed (migration `0012` dropped the field)

### Frontend (`src/`)

- `src/types/notification.ts` — `MessageTemplate`, `Campaign`, `NotificationLog`, `TriggerEvent`
- `src/lib/api/services/notifications.ts` — `getTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate`, `sendCampaign`, `getCampaigns`
- `src/components/portals/front-desk/messaging/TemplateManagement.tsx` — template CRUD dialog with variable chips
- `src/components/portals/front-desk/messaging/NewCampaignForm.tsx` — recipient search + order tracking ID insertion + send via campaign API
- `src/components/portals/front-desk/orders/MessageCustomerDialog.tsx` — upgraded: loads real templates, resolves `{{variables}}` inline for preview, sends via `notificationsService.sendCampaign()`
- `src/components/portals/front-desk/orders/ActionCenterTab.tsx` — clean rewrite: 3-column layout; inline "Convert to Delivery" address capture on pickup cards; amber unpaid warning cards in dispatch column
- `src/components/portals/front-desk/orders/DispatchDriverDialog.tsx` — loads active drivers (`GET /api/staff/?role=driver`), calls `ordersService.dispatch(orderId, driverId)`
- `src/components/portals/front-desk/orders/FrontDeskOrders.tsx` — `handleConvertToDelivery` (PATCH order + open driver picker); pickup guard; `readyDeliveryUnpaid` filter

### Design decisions

- **SMS gateway stub** — `_send_via_gateway()` is the only change needed to go live. Set `BRIQ_API_KEY` + `BRIQ_SENDER_ID` env vars and implement `requests.post('https://karibu.briq.tz/v1/messaging/send/', ...)`.
- **Payment enforcement — triple layer** — (1) backend dispatch guard HTTP 400, (2) UI dispatch queue hides unpaid orders, (3) pickup guard prevents marking unpaid orders as picked up.
- **Convert to Delivery** — dispatches inline from the pickup card; address → PATCH order → driver picker. No separate page or dialog needed.

---


## Phase 8 — Polish & Bugfixes ✅ COMPLETE (2026-04-20)

### Payment Status Integrity

- **`AwaitingPaymentTab` filter fix** — `FrontDeskOrders.tsx`: the Awaiting Payment tab previously showed all `pending` orders regardless of payment status. Fixed to `status === 'pending' && paymentStatus !== 'paid'`. Fully paid orders now move to Action Center (Post to Baker).
- **`FrontDeskOrders.tsx` Action Center** — Updated to include `pending` orders that are fully paid so they can be posted to the baker queue.
- **Optimistic update removed** — `handleConfirmPayment` no longer prematurely sets `status = 'paid'` during a deposit. UI now waits for the API response before updating state.
- **Custom deposit amounts** — `PaymentConfirmDialog.tsx` rewritten: shows a numeric input pre-filled to 50% (editable), validates the amount is between 1 and `totalPrice − 1`, and displays a live "Balance remaining: TZS X" indicator. Passes the exact collected amount to the parent.
- **Toast distinction** — Success toast now correctly shows "Full payment confirmed! Moving to baker queue" vs "Deposit of TZS X recorded. Balance: TZS Y outstanding."
- **Stale DB record repaired** — `TRK-TNL2PL` was fully paid but stuck in `unpaid` state. Repaired via Django shell: `payment_status → paid`.

### Self-Healing Reminder Guard (Backend)

- **`orders/views.py` — `send_payment_reminder` / `send_overdue_notice`** — if an order's `balance == 0` but `payment_status` is stale, the action now auto-syncs `payment_status = 'paid'`, saves the record, and returns HTTP 400 with `"Order is fully paid. Status has been corrected."` This prevents misleading reminder SMS and self-corrects data without needing a manual shell fix.
- **`send_payment_reminder` / `send_overdue_notice`** — now pass `balance` and `total_price` explicitly as `extra_context` so the SMS body never shows "Balance: TZS 0" for stale records.

### SMS Status UI (Frontend)

#### `AwaitingPaymentTab.tsx` — per-button state machine
- Each Reminder/Overdue button tracks its own `SendStatus`: `idle → sending → success | error | timeout`
- Button icon changes: `Bell` / `AlertCircle` → `Loader2` (sending) → `CheckCircle2` (success) → `XCircle` (error/timeout)
- Button border tint changes to match the status
- `StatusPill` component appears below each button on terminal states; auto-clears after 4 seconds
- Both buttons disabled while any send is in progress (prevents duplicate requests)

#### `MessageCustomerDialog.tsx` — inline status banner
- `SendStatus` state replaces plain `sending: boolean`
- After send: compose area is replaced by a `StatusBanner`
  - **Success** (green): "Message sent! Delivered to [name]." Dialog auto-closes after 1.8 s
  - **Error** (red): "Failed to send. Check gateway settings and try again." Button turns red → "Retry"
  - **Timeout** (amber): "Request timed out. The SMS gateway may not have delivered the message." Button turns red → "Retry"
- Cancel button relabelled "Close" after success

#### `NewCampaignForm.tsx` / `FrontDeskMessaging.tsx` — campaign inline result
- `sendResult: 'success' | 'error' | 'timeout' | null` and `sentCount` state added to `FrontDeskMessaging`
- `StatusBanner` component inside `NewCampaignForm` appears between recipient list and footer buttons
  - **Success** (green): "✓ Campaign delivered to N recipients." Form resets and closes after 2 s; button changes to "Send Another"
  - **Error** (red): "Failed to send. Check gateway settings." Button turns red → "Retry"
  - **Timeout** (amber): "Request timed out. The SMS gateway may be slow — please retry." Button turns red → "Retry"
- `sentCampaignCount` renamed from `sentCount` (stats derived variable) to avoid naming collision with the new state

### Error Handling

- **`handle-error.ts` — axios `ECONNABORTED` detection** — Added explicit check for `code === 'ECONNABORTED'` or `message.includes('timeout')` before the generic "no response" fallback. Now shows: `"The request timed out. The SMS gateway may be slow — please try again."` instead of the misleading "Could not reach the server."

---

## Phase 9 — Real-time Order Updates (Django Channels) ⬜ NOT STARTED

**Backend:** Django Channels WebSocket consumer, Redis channel layer

**Frontend:** Activate `src/lib/hooks/use-order-updates.ts`

---

## Phase 10 — Celery Async Jobs ⬜ NOT STARTED

Debt status sync, recurring expense creation, low-stock notifications, delivery timeout alerts.
