# Bakeflow Frontend — Architecture Reference

> Describes the frontend structure as-built. For API integration steps, see `API_INTEGRATION.md`.

---

## 1. Directory Structure

```
src/
├── app/                          # Next.js App Router — routing only, no UI logic
│   └── (dashboard)/
│       ├── baker/
│       │   ├── layout.tsx        # PortalErrorBoundary wrapper
│       │   └── active/page.tsx   # 4-line shell → <BakerActive />
│       ├── front-desk/layout.tsx
│       ├── manager/layout.tsx
│       ├── inventory/layout.tsx
│       ├── driver/layout.tsx
│       ├── decorator/layout.tsx
│       └── packing/layout.tsx    # future enhancement — packing portal exists but step removed from flow
│
├── components/
│   ├── portals/                  # All portal UI — one folder per role
│   │   ├── baker/                # BakerActive, BakerLogin, BulkBatchPanel, ...
│   │   ├── front-desk/           # FrontDeskOrders, OrderAlertsBar, PaymentConfirmDialog, ...
│   │   ├── manager/
│   │   │   ├── inventory/        # ItemFormDialog.tsx, SupplierFormDialog.tsx (manager-only sub-components)
│   │   │   ├── reports/          # ManagerReports + tab sub-components
│   │   │   └── *.tsx             # ManagerDashboard, ManagerInventory, ManagerUsers,
│   │   │                         # ManagerRevenue, ManagerAccounts (Expenses),
│   │   │                         # ManagerRollout, ...
│   │   ├── inventory/            # Inventory clerk portal: InventoryDashboard, InventoryStockIn, InventoryRollout, InventoryStock
│   │   ├── decorator/
│   │   ├── driver/
│   │   └── packing/              # future enhancement — packing portal exists but step removed from flow
│   ├── shared/                   # Cross-portal reusable components
│   │   ├── PortalLoginForm.tsx       # Generic login card used by all portals
│   │   ├── PortalErrorBoundary.tsx
│   │   ├── MenuManagement.tsx        # Menu item + category management page (manager + front-desk)
│   │   └── MenuItemFormDialog.tsx    # Add/edit menu item dialog; used by MenuManagement
│   ├── layout/                   # Sidebars, nav
│   └── ui/                       # shadcn/ui primitives (do not edit)
│
├── types/                        # TypeScript interfaces — source of truth
│   ├── order.ts                  # Order, OrderStatus, NewOrderData, OverdueAlert, ...
│   ├── inventory.ts              # InventoryItem, StockEntry, DailyRollout, Supplier, SupplierInline,
│   │                             # StockEntryPayload, DailyRolloutPayload, InventoryItemPayload, SupplierPayload
│   ├── staff.ts
│   ├── finance.ts
│   ├── production.ts             # DailyBatchItem, TimerState, BulkBatch, FulfillmentChoice,
│   │                             # FulfillmentMethod, BatchIngredient, BatchIngredientPayload,
│   │                             # NewBatchPayload
│   ├── task.ts
│   ├── customer.ts
│   └── index.ts                  # Re-exports everything from @/types
│
├── data/
│   ├── mock/                     # Temporary mock arrays — deleted per phase
│   │   ├── orders.ts             # → replaced in Phase 2
│   │   ├── staff.ts              # → replaced in Phase 3 ✅ deleted
│   │   ├── customers.ts          # → replaced in Phase 3 ✅ deleted
│   │   ├── inventory.ts          # → replaced in Phase 4 ✅ deleted
│   │   ├── finance.ts            # → partially replaced in Phase 5 (mockDebts retained)
│   │   │                         # mockExpenses, mockBusinessExpenses deleted
│   │   ├── production.ts         # → replaced in Phase 2
│   │   ├── tasks.ts              # → replaced in Phase 6
│   │   ├── helpers.ts            # generateTrackingId() — mock only, remove in Phase 2
│   │   └── index.ts              # Documents which phase retires each file
│   └── constants/                # Permanent UI config (labels, colours, menus)
│       ├── labels.ts             # statusLabels, statusColors, orderTypeLabels, ...
│       ├── menus.ts              # bakeryMenu, cakeFlavours, icingTypes
│       ├── categories.ts         # expenseCategories, businessExpenseCategories, ExpenseCategory, BusinessExpenseCategory
│       ├── tracking.ts           # trackingStages
│       └── index.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Axios instance with JWT interceptors (activate in Phase 1)
│   │   ├── services/             # One file per domain — swap TODOs for real calls
│   │   │   ├── auth.ts           # Phase 1
│   │   │   ├── orders.ts         # Phase 2
│   │   │   ├── inventory.ts      # Phase 4
│   │   │   ├── customers.ts      # Phase 3
│   │   │   ├── finance.ts        # Phase 5
│   │   │   ├── staff.ts          # Phase 3
│   │   │   ├── tasks.ts          # Phase 6
│   │   │   ├── reports.ts        # Phase 7
│   │   │   └── messaging.ts      # Phase 8
│   │   └── index.ts              # Re-exports all services
│   ├── hooks/
│   │   ├── use-portal-login.ts   # Handles login form state; validates JWT role claim before storing token
│   │   ├── use-role-auth.ts      # Per-page role guard; decodes in-memory JWT and redirects on mismatch
│   │   └── use-manager-auth.ts
│   └── utils/
│       ├── date.ts               # daysUntilDue(), minutesSincePosted() — permanent
│       └── handle-error.ts       # handleApiError() — maps DRF errors to toasts
│
└── config/
    ├── constants.ts              # Business rules, timing, brand colours
    └── demo-credentials.ts       # Demo users — remove in Phase 1
```

---

## 2. Architectural Rules

These must be maintained throughout development and integration:

| Rule | Rationale |
|---|---|
| `app/` pages are 4-line shells only | Keeps routing separate from UI; enables easy layout changes |
| All types live in `src/types/` | Single source of truth; backend response types added here |
| Mock data only in `src/data/mock/` | Clear deletion target per phase; never scattered in components |
| API calls only in `src/lib/api/services/` | Swap one function at a time without touching components |
| UI constants only in `src/data/constants/` | Never hardcoded in component JSX |
| `components/ui/` is never edited | shadcn/ui — regenerate via CLI if updates needed |
| Never add a new login page from scratch | Use `<PortalLoginForm>` with the appropriate props |
| Never create a type in a component file | Add it to `src/types/` and import it |

---

## 3. State Management Strategy

No global state library is used — and none should be added unless a clear need arises.

| Data type | Where it lives |
|---|---|
| Server data (orders, inventory, etc.) | `useState` inside each portal component, fetched in `useEffect` |
| Auth session | Access token: JS memory (`client.ts` module variable). Refresh token: HttpOnly SameSite=Strict cookie (managed by Django). |
| UI state (dialogs, tabs, timers) | Local `useState` in the component or subcomponent that owns it |
| Global toasts | Sonner — call `toast()` directly, no context needed |
| Error state | `PortalErrorBoundary` catches render errors; `try/catch` + `handleApiError()` for async errors |

When a portal grows to share data across many subcomponents, introduce a React Context scoped to that portal only — not a global store.

---

## 4. Component Decomposition Pattern

Large portal components are split by UI section, not by generic abstraction:

- The **parent** owns all shared state and mutation handlers.
- **Dialogs and modals** are extracted as their own components — they have a defined prop contract (`open`, `onOpenChange`, `onConfirm`) and own only their local form state.
- **Panels** (e.g. `BulkBatchPanel`) own their internal form state and emit completed data objects via a callback (`onCreateBatch`).
- **Cards** (e.g. `BakingOrderCard`) are purely display — receive everything as props, emit user actions via callbacks.

This keeps components under ~300 lines and makes each section independently testable.

---

## 5. Baker Portal — Order Fulfillment Flow

When a baker clicks Accept on an incoming order in `BakerActive`, the flow is:

1. **Custom order** (`order.orderType === 'custom'`) → accepted immediately as Bake Fresh. No dialog shown.
2. **Menu order** → `FulfillmentDialog` opens showing **all** today's production batches with quantity remaining > 0 (no item-name matching — the baker picks from the full list).
   - Baker selects one batch and clicks Accept.
   - If no batches are available, the dialog shows an empty state and Accept is disabled — the order **cannot** be accepted without a batch.
3. On confirm, the chosen batch's `quantityRemaining` is decremented optimistically in local state, and `ordersService.accept(orderId)` is called.

**Key decisions recorded here:**
- Non-custom orders require a batch — Bake Fresh is not an option for menu orders.
- Batch matching is not filtered by item name — any available batch can be assigned to any order. Strict name-matching was removed as premature at this phase.
- `FulfillmentChoice` in `src/types/production.ts` stores `{ orderId, method, batchItemId, batchItemName }` — no per-item breakdown.
- The `BulkBatchPanel` (Group Orders) is a separate feature in the baking tab that lets bakers group in-progress orders for bulk timer/QA control. It is independent of fulfillment.

**Order detail modal (`OrderDetailModal`):**
- All three card types (incoming, baking, QA) open `OrderDetailModal` on click, showing full order details: customer info, items + custom cake specs, notes, payment, tracking ID.
- Action buttons (Accept, Start, Pause, Done → QA, Fail/Pass) call `e.stopPropagation()` to prevent triggering the modal.
- The modal is controlled from `BakerActive` via `detailOrder` state — a single modal instance shared across all tabs.

**"Done → QA" button visibility rule:**
- The button only appears on a `BakingOrderCard` once `td.pct >= 100` (timer has reached or exceeded the estimated bake time).
- While the timer is still running below 100%, only Start/Pause is shown. This prevents bakers from sending to QA before the estimated time is up.

---

## 6. Manager Portal Design Language


The manager portal uses a custom dark theme distinct from the light `bg-background` theme used by all other portals. Every manager page **must** follow this pattern — mixing conventions produces a broken white page.

| Element | Class |
|---|---|
| Page background | `bg-manager-bg` |
| Main content area | `ml-64 p-6` — no sticky header |
| Page title | `text-2xl font-bold text-white` |
| Subtitle / muted text | `text-white/40` |
| Label text (in forms) | `text-white/60` |
| Body text | `text-white` |
| Dimmed body text | `text-white/50` or `text-white/70` |
| Inputs | `bg-white/5 border-white/10 text-white placeholder:text-white/30` |
| Primary button | `bg-manager-accent hover:bg-manager-accent/85 text-white` |
| Tab bar | Raw `<button>` elements inside `border border-white/10 rounded-lg p-0.5`; active: `bg-white/10 text-white`; inactive: `text-white/40 hover:text-white/70` |
| Table wrapper | `rounded-xl border border-white/5 overflow-hidden` |
| Table header row | `border-b border-white/5 bg-white/[0.02]`, cells `text-white/40 uppercase text-xs` |
| Table body rows | `border-b border-white/5 hover:bg-white/[0.02]` |
| Row cards / panels | `rounded-xl border border-white/5 bg-white/[0.02]` |
| Dialog | `bg-manager-card border-white/10 text-white` |
| Dialog cancel button | `border-white/10 text-white/60 hover:text-white bg-transparent` |
| Status badges | `bg-<color>-500/20 text-<color>-300` |

Do not use shadcn `<Card>`, `text-foreground`, `text-muted-foreground`, `bg-background`, or `bg-muted` inside manager pages — these are light-theme tokens.

---

## 7. Error Boundary Coverage

Every portal layout wraps its children in `<PortalErrorBoundary>`:

```tsx
// src/app/(dashboard)/baker/layout.tsx
export default function BakerLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Baker Portal">{children}</PortalErrorBoundary>
}
```

- **Render errors** (thrown during JSX evaluation) are caught by the boundary and show a branded recovery UI.
- **Async errors** (failed API calls, promise rejections) are caught by `try/catch` and shown via `handleApiError(err)`.
- These two mechanisms are complementary — never rely on just one.
