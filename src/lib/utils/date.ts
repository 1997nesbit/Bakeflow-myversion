// ---- DATE / TIME DISPLAY UTILITIES ----
// These are pure frontend display helpers — they will remain here permanently.

/** Returns the number of days between today and a given pickup date. */
export function daysUntilDue(pickupDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(pickupDate)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Returns the number of minutes elapsed since an order was posted to the baker queue. */
export function minutesSincePosted(postedAt: string): number {
  return Math.floor((Date.now() - new Date(postedAt).getTime()) / (1000 * 60))
}
