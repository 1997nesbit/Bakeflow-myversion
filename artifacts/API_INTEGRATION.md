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

**Phase 1 checklist — do not mark done until all pass:**
- [ ] `npm install axios jwt-decode` — both packages required before activating `client.ts`
- [ ] Django login endpoint returns `{ access }` in JSON body and sets `bakeflow_refresh` as HttpOnly SameSite=Strict cookie — see `BACKEND_ARCHITECTURE.md §8` for the full Django view code
- [ ] Login works on all portals; access token stored in JS memory only (not in localStorage or DevTools Application storage)
- [ ] Page refresh restores the session silently — `initAuth()` in root layout exchanges the cookie for a fresh access token without requiring re-login
- [ ] Proactive refresh fires 1 minute before access token expiry — verified by checking the timeout in the browser debugger
- [ ] 401 reactive fallback works — if proactive refresh misses, the interceptor retries the original request after a silent refresh
- [ ] Logout calls `/auth/logout/`, server blacklists the token, cookie is cleared — verified by checking that the refresh cookie is absent after logout
- [ ] Role guards decode the JWT and validate the `role` claim matches the portal — wrong-role tokens redirect to the portal login
- [ ] **Install `django-axes`** on the backend for brute-force lockout — see `BACKEND_ARCHITECTURE.md §8`. Test that 5 consecutive failed logins lock the IP/username combination.

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
- [ ] Mock files deleted: `src/data/mock/orders.ts`, `production.ts`, `helpers.ts`

---

### Phase 3 — Customers & Staff

Activate `customersService` and `staffService`. Update `ManagerCustomers`, `ManagerUsers`, `FrontDeskSearch`. Delete `src/data/mock/customers.ts` and `staff.ts`.

**Phase 3 checklist:**
- [ ] Apply the AbortController pattern (see Phase 2) to every new `useEffect` fetch.
- [ ] **Role-aware staff serializer** — The `User` model has a `salary` field that must only be visible to the manager role. The backend's `StaffViewSet` must use `get_serializer_class()` to return `StaffDetailSerializer` (includes salary) for managers and `StaffPublicSerializer` (name, role, avatar only) for all other roles. See `BACKEND_ARCHITECTURE.md §8`. Verify by confirming the salary field is absent from the staff list response when logged in as any non-manager role.
- [ ] **Public tracking page — convert to Server Component.** The `/track/[id]` page is the only public, SEO-indexable page in the app. After this phase activates the tracking endpoint (`GET /api/orders/track/{tracking_id}/`), convert `src/app/track/[id]/page.tsx` into an async Server Component that fetches server-side:
  ```tsx
  // src/app/track/[id]/page.tsx
  import { ordersService } from '@/lib/api/services/orders'
  import { OrderTracking } from '@/components/public/OrderTracking'

  export async function generateMetadata({ params }: { params: { id: string } }) {
    return { title: `Track order ${params.id} — Bakeflow` }
  }

  export default async function TrackingPage({ params }: { params: { id: string } }) {
    const order = await ordersService.getByTrackingId(params.id).catch(() => null)
    return <OrderTracking initialOrder={order} trackingId={params.id} />
  }
  ```
- [ ] Mock files deleted: `src/data/mock/customers.ts`, `staff.ts`

---

### Phase 4 — Inventory

Activate `inventoryService`. Update `InventoryDashboard`, `InventoryStockIn`, `InventoryAlerts`, `InventoryRollout`, `BakerActive` (daily batch data). Delete `src/data/mock/inventory.ts`.

**Phase 4 checklist:**
- [ ] Apply the AbortController pattern to every new `useEffect` fetch.
- [ ] Inventory list responses are paginated — read `.results` from `PaginatedResponse<InventoryItem>`.

---

### Phase 5 — Finance & Payments

Activate `financeService`. Update `InventoryExpenses`, `ManagerPayments`, `ManagerDebts`. Delete `src/data/mock/finance.ts`.

**Phase 5 checklist:**
- [ ] Apply the AbortController pattern to every new `useEffect` fetch.
- [ ] Finance list responses are paginated — read `.results`.

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

**When integrating Phase 1:**
- Install `jwt-decode`: `npm install jwt-decode` (also needed for `client.ts` proactive refresh scheduling)
- The JWT `access` token encodes `role` and `name`. Decode it client-side with `jwtDecode<JwtPayload>(token)`.
- `use-role-auth.ts` reads the in-memory token via `getAccessToken()`, decodes it, and validates the `role` claim matches the portal.
- Redirect to the portal's `/login` if `getAccessToken()` returns null AND `initAuth()` fails (cookie absent or expired).
- See the full replacement pattern in the TODO comment inside `use-role-auth.ts`.

**Role → portal mapping:**

| Django role | Portal path |
|---|---|
| `front_desk` | `/front-desk` |
| `baker` | `/portal/baker` |
| `inventory_clerk` | `/inventory` |
| `manager` | `/manager` |
| `decorator` | `/portal/decorator` |
| `driver` | `/portal/driver` |
| `packing` | `/portal/packing` |

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
