// ---- MOCK-ONLY HELPER FUNCTIONS ----
// generateTrackingId: mock replacement for server-generated IDs.
// TODO (Phase 2): Remove this file. The backend will generate tracking IDs on order creation.
// daysUntilDue and minutesSincePosted are real display utilities — they live in @/lib/utils/date

/** Generates a placeholder tracking ID for mock order creation. */
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TRK-'
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return result
}
