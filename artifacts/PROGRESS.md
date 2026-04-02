# Bakeflow — Implementation Progress

Last updated: 2026-04-03 (Phase 3 complete)

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
- `apps/orders/views.py` — `OrderViewSet` with all state-transition actions (`post_to_baker`, `accept`, `quality_check`, `mark_packing`, `mark_ready`, `dispatch`, `mark_delivered`, `record_payment`), `MenuViewSet`, `ProductionViewSet`
- `apps/orders/urls.py` — registered: `/api/orders/`, `/api/menu/`, `/api/production/batches/`
- `djangorestframework-camel-case` installed — auto-converts snake_case ↔ camelCase; no field renames needed in frontend
- Migrations generated and applied for `customers` and `orders` apps

### Frontend (`src/`)

- `src/lib/api/services/orders.ts` — fully activated; all order actions + `productionService`
- `src/types/order.ts` — `Order` now uses nested `customer: OrderCustomer` object; `NewOrderData` keeps flat fields for creation form
- All portal components updated to use real API calls with AbortController pattern:
  - `BakerActive`, `BakerDashboard`, `BakerHistory`, `BakerProduction`
  - `FrontDeskOrders`, `FrontDeskDashboard`, `FrontDeskSearch`, `FrontDeskMessaging`
  - `DriverDashboard`, `PackingDashboard`, `DecoratorDashboard`
  - `ManagerDashboard`, `ManagerOrderHistory`, `ManagerPayments`, `ManagerReports`
  - `OrderTracking` (public) — now fetches from `/api/orders/track/{id}/`
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

## Phase 4 — Inventory ⬜ NOT STARTED

**Backend:** `apps/inventory`

**Frontend:** Activate `inventoryService`. Delete `src/data/mock/inventory.ts`.

---

## Phase 5 — Finance & Payments ⬜ NOT STARTED

**Backend:** `apps/finance`

**Frontend:** Activate `financeService`. Delete `src/data/mock/finance.ts`.

---

## Phase 6 — Tasks ⬜ NOT STARTED

**Backend:** `apps/tasks`

**Frontend:** Activate `tasksService`. Delete `src/data/mock/tasks.ts`.

---

## Phase 7 — Reports ⬜ NOT STARTED

**Backend:** `apps/reports`

**Frontend:** Activate `reportsService`.

---

## Phase 8 — Messaging ⬜ NOT STARTED

**Backend:** `apps/messaging`

**Frontend:** Activate `messagingService`.

---

## Phase 9 — Real-time Order Updates (Django Channels) ⬜ NOT STARTED

**Backend:** Django Channels WebSocket consumer, Redis channel layer

**Frontend:** Activate `src/lib/hooks/use-order-updates.ts`

---

## Phase 10 — Celery Async Jobs ⬜ NOT STARTED

Debt status sync, recurring expense creation, low-stock notifications, delivery timeout alerts.
