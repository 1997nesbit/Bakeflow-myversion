# Bakeflow — Backend API Integration Guide

> Step-by-step guide for connecting the frontend to the Django + DRF backend.
> For the frontend structure, see `FRONTEND_ARCHITECTURE.md`.
> For the backend plan, see `BACKEND_ARCHITECTURE.md`.

---

## 1. Phase-by-Phase Integration

Each phase is independent — complete and test one before starting the next.
The service stubs in `src/lib/api/services/` already have the correct `apiClient` calls written as comments above each `throw`. Uncomment and delete the throw.

---

### Phase 1 — Authentication (start here)

**Files to touch:**

1. **`src/lib/api/client.ts`** — Uncomment the full Axios instance. The Option C auth strategy is already documented inside the stub (in-memory access token + HttpOnly cookie refresh token). Read the comments carefully before activating.

2. **`src/lib/api/services/auth.ts`** — Replace the three stub functions. The login function only needs to return the access token (the refresh cookie is set by Django automatically):
   ```ts
   // login — returns { access: string } only; refresh is in the Set-Cookie header
   return (await apiClient.post('/auth/token/', { username, password })).data

   // logout — Django blacklists the token and clears the cookie
   await apiClient.post('/auth/logout/')
   ```

3. **`src/lib/hooks/use-portal-login.ts`** — Replace the `setTimeout` mock block. The correct replacement pattern is documented in the hook's TODO comment.

4. **`src/lib/hooks/use-role-auth.ts`** — Replace the localStorage read with JWT decode. The correct replacement pattern is documented in the hook's TODO comment. The `storageKey` option is removed in Phase 1.

5. **`src/app/layout.tsx`** — Add a one-time `initAuth()` call on mount to restore the session from the HttpOnly cookie on every page load:
   ```tsx
   'use client'
   import { useEffect } from 'react'
   import { initAuth } from '@/lib/api/client'

   // Inside RootLayout or a dedicated AuthProvider child component:
   useEffect(() => { initAuth() }, [])
   ```

6. **`src/config/demo-credentials.ts`** — Keep during development; delete when real users exist in the DB.

7. **`.env.local`** (copy from `.env.local.example`) — Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.

**Phase 1 checklist — COMPLETE ✅ (2026-04-02)**
- [x] `npm install axios jwt-decode` — both packages required before activating `client.ts`
- [x] Django login endpoint returns `{ access }` in JSON body and sets `bakeflow_refresh` as HttpOnly SameSite=Strict cookie
- [x] Login accepts `{ username, password }` — username resolved by email then phone
- [x] Login works on all portals; access token stored in JS memory only (not in localStorage or DevTools Application storage)
- [x] Page refresh restores the session silently — `AuthBootstrap` component calls `initAuth()` on mount
- [x] Proactive refresh fires 1 minute before access token expiry
- [x] 401 reactive fallback works — interceptor retries the original request after a silent refresh
- [x] Logout calls `/auth/logout/`, server blacklists the token, cookie is cleared
- [x] Role guards validate in two places: (1) `usePortalLogin` decodes the JWT immediately after `authService.login()` and rejects with a toast if the role doesn't match `expectedRole` — the token is never stored and no redirect occurs; (2) `useRoleAuth` in the portal sidebar re-validates on every page load as a second defence
- [x] `django-axes` installed — 5 consecutive failed logins lock the IP/username combination

---

### Phase 2 — Orders & Production

**Files to touch:**

1. **`src/lib/api/services/orders.ts`** — Activate `getAll`, `create`, `updateStatus`, `postToBaker`, `dispatch`.

2. **`src/data/mock/orders.ts`** and **`production.ts`** — Delete once every component that imported them is updated.

3. **Components to update** — Find all `import { mockOrders }` references:
   ```
   BakerActive.tsx, FrontDeskOrders.tsx, DriverDashboard.tsx,
   PackingDashboard.tsx, DecoratorDashboard.tsx, ManagerOrderHistory.tsx
   ```
   Replace `useState<Order[]>(mockOrders)` with a `useEffect` that calls `ordersService.getAll()`.

4. **`src/data/mock/helpers.ts`** — `generateTrackingId()` is mock-only. The backend assigns tracking IDs; remove all calls and delete the file.

**Data-fetching pattern — use this in every component:**
```ts
const [orders, setOrders] = useState<Order[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const controller = new AbortController()

  ordersService.getAll({ signal: controller.signal })
    .then(res => setOrders(res.results))   // res is PaginatedResponse<Order>
    .catch(handleApiError)
    .finally(() => setLoading(false))

  return () => controller.abort()          // cancel if component unmounts mid-fetch
}, [])
```

**Walk-in sales — `POST /api/sales/`**

Not part of the order pipeline. Use `salesService.create()` from `src/lib/api/services/sales.ts`. Payload shape is `NewSaleData` (see `src/types/sale.ts`): `items[]`, `totalPrice`, `paymentMethod`, optional `customerName`. The endpoint is live alongside Phase 2 — no additional activation needed.

**Phase 2 checklist — do not mark done until all pass:**
- [ ] **Pagination shape** — `ordersService.getAll()` returns `PaginatedResponse<Order>` (see `src/types/api.ts`). Every component that calls it must read `.results`, not treat the response as a raw array. Also store `count` if the component shows a total or needs to page.
- [ ] **Nested customer object** — The backend's `OrderDetailSerializer` returns `customer: { id, name, phone }` as a nested object, not a flat `customerId: string`. Update `src/types/order.ts`: replace `customerId: string` with `customer: { id: string; name: string; phone: string }`. Update every component that reads `order.customerId`.
- [ ] **AbortController** — Every `useEffect` that fetches must return a cleanup that calls `controller.abort()` (see pattern above). This prevents state updates on unmounted components during fast navigation.
- [ ] **Optimistic updates on status mutations** — For high-frequency status advances (baker marking stages, driver confirming delivery), update local state immediately and roll back on error:
  ```ts
  const prev = orders
  setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
  try {
    await ordersService.updateStatus(id, newStatus)
  } catch (err) {
    setOrders(prev)
    handleApiError(err)
  }
  ```
- [ ] **`OrderListSerializer` must include items** — `BakerActive` and other portals call `ordersService.getAll()` (list endpoint) and need `items[]`, `special_notes`, and `note_for_customer` on every order in the list. `OrderListSerializer` in `apps/orders/serializers.py` must nest `OrderItemSerializer(many=True, read_only=True)` and include those fields. Without this, `order.items` is `undefined` on the list response and card components cannot display item names.
- [ ] Mock files deleted: `src/data/mock/orders.ts`, `production.ts`, `helpers.ts`

---

### Phase 3 — Customers & Staff ✅ COMPLETE (2026-04-03)

`customersService` and `staffService` activated. `ManagerCustomers`, `ManagerUsers`, `ManagerDashboard`, `ManagerReports`, `ManagerTasks`, `ManagerMessages` updated. `/track/[id]/page.tsx` converted to async Server Component. `src/data/mock/customers.ts` and `staff.ts` deleted.

**Phase 3 checklist — COMPLETE ✅ (2026-04-03)**
- [x] Apply the AbortController pattern (see Phase 2) to every new `useEffect` fetch.
- [x] **Role-aware staff serializer** — The `User` model has a `salary` field that must only be visible to the manager role. The backend's `StaffViewSet` must use `get_serializer_class()` to return `StaffDetailSerializer` (includes salary) for managers and `StaffPublicSerializer` (name, role, avatar only) for all other roles. See `BACKEND_ARCHITECTURE.md §8`. Verify by confirming the salary field is absent from the staff list response when logged in as any non-manager role.
- [x] **Public tracking page — converted to Server Component.** `src/app/track/[id]/page.tsx` is an async Server Component that fetches server-side and passes `initialOrder` + `trackingId` to `<OrderTracking>`. `generateMetadata` returns the page title.
- [x] Mock files deleted: `src/data/mock/customers.ts`, `staff.ts`

---

### Phase 4 — Inventory ✅ COMPLETE (2026-04-03)

`inventoryService` activated. `InventoryDashboard`, `InventoryStockIn`, `InventoryAlerts`, `InventoryRollout` updated. `src/data/mock/inventory.ts` deleted. `apps/inventory/` Django app created with `InventoryItem`, `StockEntry`, `DailyRollout`, `Supplier`, `SupplierProduct` models, `InventoryService`, and registered endpoints. `DailyBatchItem` remains in `apps/orders` (already live since Phase 2).

**Phase 4 checklist — COMPLETE ✅ (2026-04-03)**
- [x] Apply the AbortController pattern to every new `useEffect` fetch.
- [x] Inventory list responses are paginated — read `.results` from `PaginatedResponse<InventoryItem>`.
- [x] `src/types/inventory.ts` updated — `supplierId: string` replaced with `supplier: SupplierInline | null`; `stockHealth: number` added; `StockEntryPayload` and `DailyRolloutPayload` write types added.
- [x] `InventoryRollout` hardcoded date removed — uses `new Date().toISOString().split('T')[0]`.
- [x] `rolledOutBy` free-text field removed from rollout form — set server-side from `request.user`.
- [x] All custom toast divs replaced with Sonner `toast()` calls.
- [x] `handleQuickRestock` in `InventoryAlerts` now calls `inventoryService.recordStockIn()` instead of mutating local state.
- [x] Mock file deleted: `src/data/mock/inventory.ts`

#### Phase 4 extension — Menu CRUD

The Menu Management UI (`/manager/menu`, `/front-desk/menu`) is already built and uses local state. Activate it against the API by completing the following:

**Backend endpoints needed** (add to `apps/orders/views.py` `MenuViewSet`):
```
POST   /api/menu/                        create menu item
PATCH  /api/menu/{id}/                   update menu item
DELETE /api/menu/{id}/                   delete menu item
POST   /api/menu/categories/             create category
PATCH  /api/menu/categories/{slug}/      rename category (cascades to all items)
DELETE /api/menu/categories/{slug}/      delete category (reject if items exist)
```
Permissions: `IsManagerOrFrontDesk` on all write endpoints.

**Frontend activation** (`src/components/shared/MenuManagement.tsx`):
1. Replace `useState<MenuItem[]>(bakeryMenu)` with a `useEffect` fetch:
   ```ts
   useEffect(() => {
     const controller = new AbortController()
     menuService.getItems({ signal: controller.signal })
       .then(setItems)
       .catch(handleApiError)
     return () => controller.abort()
   }, [])
   ```
2. In `handleSaveItem` — replace `setItems(...)` local mutations with `menuService.createItem()` / `menuService.updateItem()` calls inside `try/catch → handleApiError`.
3. In `handleDeleteItem` — replace local filter with `menuService.deleteItem(deleteId)`.
4. In `handleAddCat` / `handleRenameCat` / `handleDeleteCat` — replace local state mutations with the corresponding `menuService.*Category()` calls; refetch `getCategories()` after each.
5. Remove `emptyCats` state — categories are server-managed once the API is live.

**Phase 4 extension checklist — COMPLETE ✅ (2026-04-03)**
- [x] `MenuViewSet` write actions added and registered in `apps/orders/urls.py`
- [x] `IsManagerOrFrontDesk` permission applied to all write endpoints
- [x] `MenuManagement` `useState` initializer replaced with `useEffect` fetch
- [x] All local mutation handlers replaced with `menuService` calls
- [x] `emptyCats` state removed; category list fetched from `menuService.getCategories()`
- [x] `bakeryMenu` static array deleted from `src/data/constants/menus.ts` — `NewOrderPage` now fetches from the API with no fallback; `AddBatchForm` quick-select chips removed
- [x] `MenuItem` type in `src/types/order.ts` gains `stockToday?: number` — populated from the `stock_today` annotation on `GET /api/menu/`
- [x] `MenuManagement` item cards show "X in stock today" (green) or "Not baked today" (muted) based on `stockToday`
- [x] `MenuItemBrowser` (order picker) shows the same stock indicator under each item name

#### Phase 4 extension — Baker batch logging with rollout ingredients (2026-04-05)

`DailyBatchItem` is fully decoupled from the menu. Batches represent cake bases and production runs. The baker enters a free-text name, quantity, optional notes, and optionally specifies which rolled-out ingredients were consumed. A new `BatchIngredient` join table links batches to `DailyRollout` rows.

`menu_item` and `category` FKs are removed from the active model (`migration 0006` drops `category`, `migration 0007` creates `BatchIngredient`).

**Write payload — `POST /api/production/batches/`:**
```json
{
  "product_name": "Vanilla Sponge Base",
  "quantity_baked": 40,
  "notes": "",
  "ingredients": [
    { "rollout_id": "<uuid>", "quantity_used": "30.000" }
  ]
}
```

**Validation rules:**
- `quantity_used` per ingredient ≤ `rollout.quantity − Σ(existing BatchIngredient.quantity_used for that rollout)`
- Validated server-side with `select_for_update()` on each rollout row (race-safe)
- Also validated client-side in `AddBatchForm` — the submit button is disabled until all rows pass

**`GET /api/inventory/rollouts/`** now annotates each rollout with `quantity_used` (Coalesce Subquery over `BatchIngredient`) so the form can show available stock.

**Checklist — COMPLETE ✅ (2026-04-05)**
- [x] `BatchIngredient(batch FK, rollout FK→inventory.DailyRollout, quantity_used decimal)` model added to `apps/orders`
- [x] Migration `0006_remove_dailybatchitem_category` — drops `category` column
- [x] Migration `0007_batchingredient` — creates `orders_batchingredient` table
- [x] `DailyBatchItemWriteSerializer` — `product_name`, `quantity_baked`, `notes`, `ingredients[]`
- [x] `BatchIngredientWriteSerializer` — `rollout_id` (UUID), `quantity_used` (Decimal, min 0.001)
- [x] `ProductionService.create_batch` — validates each rollout with `select_for_update()`, creates batch + ingredients atomically
- [x] `get_today_batches` — `prefetch_related('ingredients__rollout__inventory_item')` (no N+1)
- [x] `DailyBatchItemSerializer` — nests `BatchIngredientSerializer` (id, rollout, item_name, item_unit, quantity_used)
- [x] `DailyRolloutSerializer` — `quantity_used` DecimalField (default 0, populated by annotation)
- [x] `InventoryViewSet.rollouts` — annotates with `Coalesce(Subquery(Sum BatchIngredient.quantity_used), Value(0))`
- [x] `src/types/inventory.ts` `DailyRollout` — `quantityUsed: number` added
- [x] `src/types/production.ts` — `BatchIngredient`, `BatchIngredientPayload` interfaces; `DailyBatchItem.ingredients` and `NewBatchPayload.ingredients` added; `category` and `BatchCategory` removed
- [x] `orders.ts` `createBatch` — maps `ingredients` to snake_case for the API
- [x] `AddBatchForm` — fetches today's rollouts on mount; dynamic ingredient rows; per-row available computed accounting for other rows in same form; inline `AlertCircle` error; submit disabled until valid
- [x] `BatchCard` — ingredients section with item name + quantity_used per row

---

### Phase 5 — Finance & Payments ✅ COMPLETE (2026-04-03)

Unified `FinancialTransaction` ledger. `financeService` activated. `InventoryExpenses`, `ManagerAccounts`, `ManagerReports` (expenses tab) updated. `mockExpenses` and `mockBusinessExpenses` deleted. `ManagerDebts` and `mockDebts` deferred.

**Phase 5 checklist — COMPLETE ✅ (2026-04-03)**
- [x] Apply the AbortController pattern to every new `useEffect` fetch.
- [x] Finance list responses are paginated — read `.results`.
- [x] `apps/finance/` Django app created — `FinancialTransaction` model with `direction` (`in`|`out`) and `type` discriminator (`order_payment`, `sale`, `stock_expense`, `business_expense`).
- [x] `GET /api/transactions/` — filterable by `direction`, `type`, `start`, `end`. `IsManager` permission.
- [x] `POST /api/transactions/` — expense rows only (`stock_expense` | `business_expense`). `IsManagerOrInventory` permission. `direction='out'` set server-side.
- [x] `OrderService.record_payment()` creates a `direction='in', type='order_payment'` row as a side effect (inside the same `atomic` block).
- [x] `SaleViewSet.create()` creates a `direction='in', type='sale'` row as a side effect.
- [x] `Expense` and `BusinessExpense` frontend types removed — replaced by `FinancialTransaction` and `NewExpensePayload` in `src/types/finance.ts`.
- [x] `ExpenseCategory` and `BusinessExpenseCategory` type aliases moved to `src/data/constants/categories.ts` (they are UI constants, not domain types).
- [x] `AddExpenseDialog` updated — emits `NewExpensePayload` to parent instead of constructing a local `Expense`; `expenseCount` prop removed.
- [x] `ManagerDebts` and `mockDebts` deferred — `DebtRecord` type retained in `src/types/finance.ts`.
- [x] `src/data/mock/finance.ts` — `mockExpenses` and `mockBusinessExpenses` deleted; `mockDebts` retained.
- [x] **Transactions sidebar section** — `PortalSidebar` extended with `NavItem.children` support; `managerNav` gains a collapsible `Transactions` group with `Revenue` and `Expenses` children. `NavItem.href` is now optional to accommodate group-only entries.
- [x] `ManagerRevenue` (`/manager/revenue`) — fetches `direction=in`; shows order payments and walk-in sales.
- [x] `ManagerAccounts` overwritten as unified Expenses page (`/manager/expenses`) — fetches `direction=out`; Business/Stock toggle in the add dialog; category filter adapts to selected type.
- [x] `/manager/accounts` — redirects to `/manager/expenses`.

#### Phase 5 extension — Summary endpoints & KPI fixes (2026-04-06)

**Problem solved:** DRF `DecimalField` serializes values as strings by default. Frontend `reduce` operations that assumed numeric values produced string concatenation (e.g. `"0200000.0070000.00"` instead of `270000`). Additionally, computing KPI totals in-component by iterating paginated list results is incorrect — totals would only reflect the current page.

**Solution:** Backend summary endpoints aggregate on the server; frontend components read the pre-aggregated numbers directly.

**New endpoints:**

| Endpoint | Permission | Returns |
|---|---|---|
| `GET /api/orders/summary/` | `IsAuthenticated` | `count`, `total_revenue`, `total_price`, `total_outstanding`, `by_status`, `by_payment_method` |
| `GET /api/transactions/summary/` | `IsAuthenticated` | `total`, `count`, `by_type` (each with `total`, `count`) |

Both endpoints accept the same query params as their list counterparts (`direction`, `type`, `status`, `pickup_date`, `start`, `end`). `total_revenue` in the orders summary is always sourced from `FinancialTransaction` — never from `Order.amount_paid`.

**Frontend types added** (`src/types/`):
- `OrderSummary` — `count`, `totalRevenue`, `totalPrice`, `totalOutstanding`, `byStatus`, `byPaymentMethod`
- `TransactionSummary` — `total`, `count`, `byType` (nested `TransactionTypeSummary`)

**Service functions added:**
- `ordersService.getSummary(options?)` — `GET /api/orders/summary/`
- `financeService.getSummary(params?)` — `GET /api/transactions/summary/`

**Components updated to use summaries:**
- `ManagerDashboard` — three summary calls replace three list fetches for KPI cards
- `ManagerRevenue` — `financeService.getSummary({direction:'in'})` for revenue KPI totals; list kept for table
- `ManagerReports` — `orderSummary.byStatus` for status chart; `orderSummary.byPaymentMethod` for method chart
- `ManagerOrderHistory` — `orderSummary` for `totalRevenue` and `totalOutstanding`
- `ManagerAccounts` — `TransactionSummary` for KPI totals; list kept for category filtering
- `FrontDeskDashboard` — `orderSummary` for `totalRevenue` and `outstandingBalance`

**`amount_paid` — cached derived field pattern** (2026-04-06):

`Order.amount_paid` is stored on the model for O(1) reads but is **never written directly**. The only write path is `OrderService._sync_payment()`, which recomputes from `SUM(transactions WHERE order=self AND direction='in')` and persists the result. This is called:
- After `FinanceService.record_order_payment()` in `OrderService.record_payment()`
- After the initial payment transaction in `OrderService.create_order()`

Never do `order.amount_paid += amount` anywhere in the codebase. The field is a cache, not a counter.

**Phase 5 extension checklist — COMPLETE ✅ (2026-04-06)**
- [x] `GET /api/orders/summary/` action added to `OrderViewSet`
- [x] `GET /api/transactions/summary/` action added to `FinancialTransactionViewSet`
- [x] `OrderSummary` and `TransactionSummary` interfaces added to `src/types/`
- [x] `ordersService.getSummary` and `financeService.getSummary` service functions added
- [x] All KPI cards in manager and front-desk portals source totals from summary endpoints
- [x] `OrderService._sync_payment()` is the single write path for `Order.amount_paid`
- [x] `OrderService.create_order()` pops `amount_paid` from `validated_data`, creates the order, then creates the transaction and calls `_sync_payment()` if amount > 0
- [x] Migration `0008` — removes `amount_paid` (intermediate step, now superseded)
- [x] Migration `0009` — restores `amount_paid` with the cached-field pattern
- [x] Migration `0010` — data migration: backfills `amount_paid` from transaction ledger for all existing orders
- [x] `AssertionError` on `GET /api/transactions/` fixed — removed redundant `source='order_id'` kwarg from `FinancialTransactionSerializer`

---

### Phase 6 — Tasks

Activate `tasksService`. Update `ManagerTasks`. Delete `src/data/mock/tasks.ts`.

**Phase 6 checklist:**
- [ ] Apply the AbortController pattern.
- [ ] Task list responses are paginated — read `.results`.

---

### Phase 7 — Reports

Activate `reportsService`. Update `ManagerReports`. This is read-only — no mutation stubs needed.

**Phase 7 checklist:**
- [ ] Apply the AbortController pattern.
- [ ] Report endpoints are not paginated (they return aggregated objects, not lists).

---

### Phase 8 — Messaging (WebSocket)

`messagingService` has no mock fallback — it was always deferred. Connect via Django Channels WebSocket. Update `FrontDeskMessaging`, `ManagerMessages`.

---

### Phase 9 — Real-time Order Updates (Django Channels)

**This phase wires the `useOrderUpdates` hook stub at `src/lib/hooks/use-order-updates.ts`.**

The stub already has the correct interface and is safe to call from any portal today. In this phase, replace its body with a real WebSocket connection.

**WebSocket authentication — use the first-message approach (not query params):**

The browser `WebSocket` API has no `Authorization` header. Do NOT pass the token as a URL query param (`?token=...`) — it appears in server access logs in plaintext. Instead, authenticate via the first message after connection:

```ts
// src/lib/hooks/use-order-updates.ts — Phase 9 implementation
const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/orders/`)

ws.onopen = () => {
  // Send auth as first message — server validates before joining role group
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: getAccessToken(),  // in-memory access token from client.ts
  }))
}
```

**Django consumer must:**
1. `accept()` the connection immediately (before auth)
2. On first message, validate the token and add to the role group — or `close(code=4001)` if invalid
3. Never send order data before auth is confirmed

**Add to `.env.local`:**
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Token expiry during long WebSocket sessions:**
The access token expires every 15 minutes. When the proactive refresh fires (in `client.ts`), the hook must send a new `authenticate` message with the fresh token to keep the connection authorised. Wire the hook to listen for token changes or simply reconnect after each proactive refresh.

**Portals that need `useOrderUpdates` wired in:**

| Portal | Role | Effect |
|---|---|---|
| `BakerActive` | `baker` | New incoming orders appear without refresh |
| `FrontDeskDashboard` | `front_desk` | Ready / delivered orders surface immediately |
| `DriverDashboard` | `driver` | Delivery assignments arrive in real time |

---

## 2. Auth & Role Guards

Auth strategy is **Option C** — access token in JS memory, refresh token in HttpOnly SameSite=Strict cookie.

**Role validation — two-layer defence:**

1. **At login (`use-portal-login.ts`)** — After `authService.login()` returns the access token, `jwtDecode` is called immediately. If `payload.role !== expectedRole`, `toast.error()` fires and the token is discarded. No redirect, no API calls, no portal access. Each login component passes its `expectedRole` to `usePortalLogin` (or to `PortalLoginForm` via the `expectedRole` prop, which forwards it to the hook).

2. **On every page load (`use-role-auth.ts`)** — Reads the in-memory token, decodes it, and validates the role claim matches the portal. Redirects to the portal's `/login` if the token is absent, expired, or the role doesn't match. This acts as a second defence for direct URL access.

**`PortalLoginForm` `expectedRole` prop** — optional `StaffRole`. When provided, the hook validates the role before storing the token. Omit only for portals without a defined backend role (currently: packing — future enhancement).

**Role → portal mapping:**

| Django role | Portal path |
|---|---|
| `front_desk` | `/front-desk` |
| `baker` | `/portal/baker` |
| `inventory_clerk` | `/inventory` |
| `manager` | `/manager` |
| `decorator` | `/portal/decorator` |
| `driver` | `/portal/driver` |
| `packing` | `/portal/packing` — future enhancement; packing step removed from flow (2026-04-03); portal retained in codebase |

---

## 3. Adding a New API Field

When the backend adds a field to an existing model (e.g. `Order` gets a `cancelledAt` timestamp):

1. Add the field to `src/types/order.ts` — the single source of truth.
2. The service function return type automatically includes it via the interface.
3. Update only the component(s) that need to display it.
4. Never add a field to a component's local state type independently of `src/types/`.

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api   # Django dev server
NEXT_PUBLIC_APP_NAME=Bakeflow
NEXT_PUBLIC_CURRENCY=TZS
NEXT_PUBLIC_TOKEN_EXPIRY_MINUTES=60
# Added in Phase 9:
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

For production, set `NEXT_PUBLIC_API_URL` to the deployed Django API URL and `NEXT_PUBLIC_WS_URL` to the WSS URL.

---

## 5. Error Handling

All backend failures must be surfaced to the user as a readable toast — never fail silently, never log-only.

### The rule

Every `await` that touches the API must be wrapped in `try/catch`. On error, call `handleApiError(err)`.

```ts
import { handleApiError } from '@/lib/utils/handle-error'

// In a component useEffect or event handler:
try {
  const res = await ordersService.getAll()
  setOrders(res.results)
} catch (err) {
  handleApiError(err)
}

// On a mutation with a custom success toast:
try {
  await ordersService.updateStatus(id, 'baker')
  toast.success('Order posted to kitchen.')
} catch (err) {
  handleApiError(err)
}
```

### What `handleApiError` does

Located at `src/lib/utils/handle-error.ts`. It handles every error shape Django DRF can return:

| DRF response shape | Example | Displayed as |
|---|---|---|
| `{ "detail": "..." }` | `"Not found."` | `"Not found."` |
| `{ "non_field_errors": ["..."] }` | `"Passwords do not match."` | `"Passwords do not match."` |
| `{ "field": ["..."] }` | `"quantity": ["Must be > 0"]` | `"Quantity: Must be > 0"` |
| No response (network down) | — | `"Could not reach the server..."` |
| HTTP 401 | Token expired | `"Your session has expired..."` |
| HTTP 403 | Wrong role | `"You do not have permission..."` |
| HTTP 500 | Server crash | `"A server error occurred. The team has been notified."` |

### When to add custom handling before the toast

```ts
try {
  await ordersService.create(data)
} catch (err) {
  setSubmitting(false)    // restore button state first
  handleApiError(err)
}
```

### What NOT to do

```ts
// ✗ Silent failure
} catch { /* nothing */ }

// ✗ Raw error message
} catch (err) { toast.error(String(err)) }

// ✗ Alert
} catch (err) { alert(err.message) }

// ✓ Correct
} catch (err) { handleApiError(err) }
```

---

## 6. Pre-Deployment Production Checklist

Complete this before the first production deploy. None of these are optional.

### Django `config/settings/production.py`

```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']   # explicit list — never '*'

# Force HTTPS
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000           # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

# Response headers
X_FRAME_OPTIONS = 'DENY'                 # clickjacking protection
SECURE_CONTENT_TYPE_NOSNIFF = True       # MIME sniffing protection
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
```

### Checklist

- [ ] `DEBUG = False` — Django leaks full stack traces in responses when True
- [ ] `ALLOWED_HOSTS` set explicitly — never `['*']` in production
- [ ] All HTTPS/HSTS settings enabled
- [ ] `SECRET_KEY` loaded from environment variable, not hardcoded
- [ ] Database credentials in environment variables
- [ ] Redis connection string includes authentication password
- [ ] CORS `ALLOWED_ORIGINS` limited to the production frontend domain only
- [ ] `django-axes` `AXES_FAILURE_LIMIT` tuned for production (5 failures → 1 hour lockout)
- [ ] Token blacklist table included in database migrations (`python manage.py migrate`)
- [ ] DRF exception handler configured to return generic 500 messages (no tracebacks in JSON responses)
- [ ] Rate limits on login endpoint verified under load
- [ ] `SECURE_HSTS_PRELOAD = True` only after confirming HTTPS works end-to-end (cannot be undone easily)

---

## 7. Key Conventions

- **Never import from `src/data/mock/`** in a component after that phase is complete.
- **Never put API calls directly in a component** — always go through `src/lib/api/services/`.
- **Never call `toast.error()` with a raw error object or string** — always use `handleApiError(err)`.
- **Delete mock files immediately** after all components in that phase are updated — do not leave orphaned imports.
- **One phase at a time** — do not partially activate two phases simultaneously; it makes rollback difficult.
- **Always use `PaginatedResponse<T>`** — all list service functions return `PaginatedResponse<T>`. Read `.results` in components; never assume the response is a raw array.
- **Always use `AbortController`** — every `useEffect` data fetch must return a cleanup that calls `controller.abort()`. Pass the signal to the service call so Axios can cancel the in-flight request on unmount.
- **Never store tokens in localStorage** — access token lives in the `client.ts` module variable only; refresh token is in the HttpOnly cookie managed by Django.
- **camelCase is handled by `djangorestframework-camel-case`** — the DRF renderer converts snake_case response fields to camelCase automatically; the parser converts camelCase request bodies back to snake_case. Frontend types use camelCase; backend serializer fields use snake_case. Services that build request payloads manually must use snake_case keys (e.g. `{ menu_item_id: ... }` not `{ menuItemId: ... }`).
- **Computed list fields via correlated Subquery** — when a list endpoint needs an aggregated value derived from a related model (e.g. `stock_today` on `MenuItem` from `DailyBatchItem`), use a correlated `Subquery` annotation rather than `Sum(filter=Q(...))` across a JOIN. The subquery approach is unambiguous and avoids phantom NULL results from LEFT JOIN aggregation edge cases. See `MenuViewSet.list()` for the reference pattern.
- **DRF `DecimalField` returns strings** — `djangorestframework-camel-case` does not coerce `DecimalField` values to numbers. The JSON payload contains `"amount_paid": "240000.00"` (a string). Never use `reduce((sum, x) => sum + x.amountPaid, 0)` on DRF decimal fields — it will concatenate strings. Use `Number(x.amountPaid)` when accessing individual field values, or better yet, use a backend summary endpoint so arithmetic never happens on the frontend at all.
- **KPI totals come from summary endpoints, not list iteration** — components must never compute totals by summing over a paginated list (which only covers the current page). Use `ordersService.getSummary()` or `financeService.getSummary()` for any aggregated metric (total revenue, outstanding balance, order counts). Keep the list fetch only for rendering rows in the table.
- **`Order.amount_paid` is a cached derived field** — it is always recomputed from the `FinancialTransaction` ledger by `OrderService._sync_payment()`. Never write to it directly with `+=` or by assigning a literal value. The canonical revenue figure is always `SUM(FinancialTransaction WHERE direction='in')`; `amount_paid` on the order is a read-performance cache only.
