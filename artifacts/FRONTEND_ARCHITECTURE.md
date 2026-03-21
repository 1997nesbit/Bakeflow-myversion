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
│       └── packing/layout.tsx
│
├── components/
│   ├── portals/                  # All portal UI — one folder per role
│   │   ├── baker/                # BakerActive, BakerLogin, BulkBatchPanel, ...
│   │   ├── front-desk/           # FrontDeskOrders, OrderAlertsBar, PaymentConfirmDialog, ...
│   │   ├── manager/
│   │   ├── inventory/
│   │   ├── decorator/
│   │   ├── driver/
│   │   └── packing/
│   ├── shared/                   # Cross-portal reusable components
│   │   ├── PortalLoginForm.tsx   # Generic login card used by all portals
│   │   └── PortalErrorBoundary.tsx
│   ├── layout/                   # Sidebars, nav
│   └── ui/                       # shadcn/ui primitives (do not edit)
│
├── types/                        # TypeScript interfaces — source of truth
│   ├── order.ts                  # Order, OrderStatus, NewOrderData, OverdueAlert, ...
│   ├── inventory.ts
│   ├── staff.ts
│   ├── finance.ts
│   ├── production.ts             # TimerState, BulkBatch, FulfillmentChoice, ...
│   ├── task.ts
│   ├── customer.ts
│   └── index.ts                  # Re-exports everything from @/types
│
├── data/
│   ├── mock/                     # Temporary mock arrays — deleted per phase
│   │   ├── orders.ts             # → replaced in Phase 2
│   │   ├── inventory.ts          # → replaced in Phase 4
│   │   ├── staff.ts              # → replaced in Phase 3
│   │   ├── finance.ts            # → replaced in Phase 5
│   │   ├── production.ts         # → replaced in Phase 2
│   │   ├── customers.ts          # → replaced in Phase 3
│   │   ├── tasks.ts              # → replaced in Phase 6
│   │   ├── helpers.ts            # generateTrackingId() — mock only, remove in Phase 2
│   │   └── index.ts              # Documents which phase retires each file
│   └── constants/                # Permanent UI config (labels, colours, menus)
│       ├── labels.ts             # statusLabels, statusColors, orderTypeLabels, ...
│       ├── menus.ts              # bakeryMenu, cakeFlavours, icingTypes
│       ├── categories.ts         # expenseCategories
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
│   │   ├── use-portal-login.ts   # Demo auth logic — replace body in Phase 1
│   │   ├── use-role-auth.ts
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
| Auth session | `localStorage` (JWT access + refresh tokens) |
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

## 5. Error Boundary Coverage

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
