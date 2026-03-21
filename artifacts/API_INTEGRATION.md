# Bakeflow — Backend API Integration Guide

> Step-by-step guide for connecting the frontend to the Django + DRF backend.
> For the frontend structure, see `FRONTEND_ARCHITECTURE.md`.
> For the backend plan, see `ARCHITECTURE.md`.

---

## 1. Phase-by-Phase Integration

Each phase is independent — complete and test one before starting the next.
The service stubs in `src/lib/api/services/` already have the correct `apiClient` calls written as comments above each `throw`. Uncomment and delete the throw.

---

### Phase 1 — Authentication (start here)

**Files to touch:**

1. **`src/lib/api/client.ts`** — Uncomment the full Axios instance. Set `baseURL` from `process.env.NEXT_PUBLIC_API_URL`. The JWT interceptor is already written; it reads `access` from `localStorage`.

2. **`src/lib/api/services/auth.ts`** — Replace the three stub functions:
   ```ts
   // Replace:
   throw new Error('not yet connected')
   // With:
   return (await apiClient.post('/auth/token/', { username, password })).data
   ```

3. **`src/lib/hooks/use-portal-login.ts`** — Replace the `setTimeout` mock block with:
   ```ts
   const data = await authService.login(username, password)
   localStorage.setItem(storageKey, JSON.stringify(data))
   router.push(redirectPath)
   ```

4. **`src/config/demo-credentials.ts`** — Keep during development; delete when real users exist in the DB.

5. **`.env.local`** (copy from `.env.local.example`) — Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.

**Test:** Login works on all portals; JWT stored in localStorage; 401s trigger token refresh.

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

**Pattern to follow in every component:**
```ts
const [orders, setOrders] = useState<Order[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  ordersService.getAll()
    .then(setOrders)
    .catch(handleApiError)
    .finally(() => setLoading(false))
}, [])
```

---

### Phase 3 — Customers & Staff

Activate `customersService` and `staffService`. Update `ManagerCustomers`, `ManagerUsers`, `FrontDeskSearch`. Delete `src/data/mock/customers.ts` and `staff.ts`.

---

### Phase 4 — Inventory

Activate `inventoryService`. Update `InventoryDashboard`, `InventoryStockIn`, `InventoryAlerts`, `InventoryRollout`, `BakerActive` (daily batch data). Delete `src/data/mock/inventory.ts`.

---

### Phase 5 — Finance & Payments

Activate `financeService`. Update `InventoryExpenses`, `ManagerPayments`, `ManagerDebts`. Delete `src/data/mock/finance.ts`.

---

### Phase 6 — Tasks

Activate `tasksService`. Update `ManagerTasks`. Delete `src/data/mock/tasks.ts`.

---

### Phase 7 — Reports

Activate `reportsService`. Update `ManagerReports`. This is read-only — no mutation stubs needed.

---

### Phase 8 — Messaging (WebSocket)

`messagingService` has no mock fallback — it was always deferred. Connect via Django Channels WebSocket. Update `FrontDeskMessaging`, `ManagerMessages`.

---

## 2. Auth & Role Guards

Each portal reads its auth payload from `localStorage` in `use-role-auth.ts` and `use-manager-auth.ts`.

**When integrating Phase 1:**
- The JWT `access` token encodes `role`. Decode it client-side (use `jwt-decode`) and validate the role matches the current portal.
- Redirect to the portal's `/login` if the token is absent or expired.
- `use-portal-login.ts` already handles the write; the read-side hooks need updating to decode the JWT rather than reading a mock `role` field.

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
```

For production, set `NEXT_PUBLIC_API_URL` to the deployed Django API URL.

---

## 5. Error Handling

All backend failures must be surfaced to the user as a readable toast — never fail silently, never log-only.

### The rule

Every `await` that touches the API must be wrapped in `try/catch`. On error, call `handleApiError(err)`.

```ts
import { handleApiError } from '@/lib/utils/handle-error'

// In a component useEffect or event handler:
try {
  const orders = await ordersService.getAll()
  setOrders(orders)
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

If a failure requires resetting UI state (e.g. re-enabling a button, clearing a field), do that first:

```ts
try {
  await ordersService.create(data)
} catch (err) {
  setSubmitting(false)    // restore button state
  handleApiError(err)     // show user-readable toast
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

## 6. Key Conventions

- **Never import from `src/data/mock/`** in a component after that phase is complete.
- **Never put API calls directly in a component** — always go through `src/lib/api/services/`.
- **Never call `toast.error()` with a raw error object or string** — always use `handleApiError(err)`.
- **Delete mock files immediately** after all components in that phase are updated — do not leave orphaned imports.
- **One phase at a time** — do not partially activate two phases simultaneously; it makes rollback difficult.
