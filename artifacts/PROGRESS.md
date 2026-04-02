# Bakeflow — Implementation Progress

Last updated: 2026-04-02

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

## Phase 2 — Orders & Production ⬜ NOT STARTED

**Backend:** `apps/orders` — `Order`, `OrderItem`, `OrderStatusHistory`, `MenuItem`, `OrderService`, `OrderStateValidator`

**Frontend:** Activate `src/lib/api/services/orders.ts`; update `BakerActive`, `FrontDeskOrders`, `DriverDashboard`, `PackingDashboard`, `DecoratorDashboard`, `ManagerOrderHistory`. Delete `src/data/mock/orders.ts`, `production.ts`, `helpers.ts`.

---

## Phase 3 — Customers & Staff ⬜ NOT STARTED

**Backend:** `apps/customers`

**Frontend:** Activate `customersService`, `staffService`. Update `ManagerCustomers`, `ManagerUsers`, `FrontDeskSearch`. Delete `src/data/mock/customers.ts`, `staff.ts`.

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
