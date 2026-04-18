// ---- APPLICATION CONSTANTS ----
// All magic numbers and business-rule values live here.
// Change a value once — it applies everywhere.

// ── Business logic ────────────────────────────────────────────────────────────

/** Minutes of baking time estimated per kilogram of custom cake. */
export const CAKE_MINUTES_PER_KG = 60

/** Fallback estimated minutes for a custom cake when kg is unknown. */
export const DEFAULT_CUSTOM_CAKE_MINUTES = 120

/** Fallback estimated minutes for a standard menu item. */
export const DEFAULT_MENU_ITEM_MINUTES = 45

/**
 * Orders below this total (TZS) cannot use deposit/payment-on-delivery terms.
 * Full upfront payment is required.
 */
export const DEPOSIT_THRESHOLD_TZS = 15_000

// ── Currency ──────────────────────────────────────────────────────────────────

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'TZS'

// ── UI timing (ms) ───────────────────────────────────────────────────────────

/** How long a success/error toast is visible. */
export const TOAST_DURATION_MS = 3_000

/** Simulated network delay for demo login. Remove when real auth is wired. */
export const DEMO_LOGIN_DELAY_MS = 600

/** How often the overdue-order check re-runs on the dashboard. */
export const ORDER_REFRESH_INTERVAL_MS = 30_000

/** Baker active-order timer tick rate. */
export const BAKER_TIMER_INTERVAL_MS = 1_000

/** Simulated driver acceptance delay in the front-desk dispatch flow. */
export const DRIVER_ACCEPT_SIMULATION_MS = 8_000

/** Delay before clearing a status message after an action. */
export const STATUS_CLEAR_DELAY_MS = 2_000

// ── Brand colours ────────────────────────────────────────────────────────────
// Used in inline styles and Recharts (which cannot consume Tailwind classes).

export const BRAND = {
  primary:   '#CA0123',
  secondary: '#e66386',
  light:     '#f89bad',
  muted:     '#fce7ea',
} as const

/** Colour palette for Recharts pie/bar charts. */
export const CHART_COLORS = [
  BRAND.primary,
  BRAND.secondary,
  BRAND.light,
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
] as const
