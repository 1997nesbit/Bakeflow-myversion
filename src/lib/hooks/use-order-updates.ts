/**
 * useOrderUpdates — real-time order status subscription.
 *
 * STUB: Currently a no-op. Wired up in Phase 9 (Django Channels WebSocket).
 *
 * When Phase 9 is active, this hook will:
 *  - Open a WebSocket connection to ws://<api>/ws/orders/?role=<role>
 *  - Subscribe to the role-scoped group (role_baker, role_front_desk, etc.)
 *  - Call onUpdate whenever the server pushes an order.status_changed event
 *  - Handle reconnection and token auth on the WS handshake
 *
 * Portal components call this hook and it keeps their order list in sync
 * without polling. Replace the stub body with real WebSocket logic in Phase 9.
 *
 * Usage (today — no-op, safe to call):
 *   const { connected } = useOrderUpdates({ onUpdate: (orderId, status) => { ... } })
 *
 * Usage (Phase 9 — same call signature, real behaviour):
 *   const { connected } = useOrderUpdates({ role: 'baker', onUpdate: handleUpdate })
 */

export interface OrderUpdatePayload {
  orderId: string
  status: string
}

interface UseOrderUpdatesOptions {
  /** Role-scoped channel to subscribe to (e.g. 'baker', 'front_desk'). */
  role?: string
  /** Called each time the server pushes a status change. */
  onUpdate: (payload: OrderUpdatePayload) => void
}

interface UseOrderUpdatesResult {
  /** True when the WebSocket connection is open. Always false in stub phase. */
  connected: boolean
}

export function useOrderUpdates(_options: UseOrderUpdatesOptions): UseOrderUpdatesResult {
  // TODO (Phase 9): replace this stub with a real WebSocket connection.
  // See artifacts/API_INTEGRATION.md — Phase 9 for implementation notes.
  return { connected: false }
}
