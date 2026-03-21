// ---- API ERROR HANDLER ----
// Converts any thrown error into a user-readable toast message.
//
// Django DRF errors arrive in several shapes — this utility normalises all of
// them so components never need to inspect the error structure themselves.
//
// Usage in a component or service:
//   import { handleApiError } from '@/lib/utils/handle-error'
//   try {
//     await ordersService.create(data)
//   } catch (err) {
//     handleApiError(err)           // shows toast, does nothing else
//   }
//
// If you need to run custom logic BEFORE showing the toast (e.g. reset a form
// field), handle it first and then call handleApiError:
//   catch (err) {
//     setFieldError('quantity', 'Invalid')
//     handleApiError(err)
//   }

import { toast } from 'sonner'

// ── DRF error response shapes ─────────────────────────────────────────────────
// { "detail": "Not found." }                          ← most common
// { "non_field_errors": ["Passwords do not match."] } ← validation
// { "username": ["This field is required."] }         ← field-level
// { "order": { "items": ["This list may not be empty."] } } ← nested

type DrfFieldErrors = Record<string, string[] | DrfFieldErrors>

interface DrfErrorResponse {
  detail?: string
  non_field_errors?: string[]
  [field: string]: string[] | string | DrfFieldErrors | undefined
}

// ── HTTP status → friendly fallback message ───────────────────────────────────
const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request contained invalid data.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
  409: 'A conflict occurred. The record may have been modified by someone else.',
  422: 'The submitted data failed validation.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'A server error occurred. The team has been notified.',
  502: 'The server is temporarily unavailable.',
  503: 'The service is temporarily down for maintenance.',
}

// ── Extract the most useful message from a DRF error body ─────────────────────
function extractDrfMessage(data: DrfErrorResponse): string | null {
  // Top-level detail string (most common)
  if (typeof data.detail === 'string') return data.detail

  // Non-field validation errors
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0]
  }

  // Field-level errors — surface the first one with its field name
  for (const [field, errors] of Object.entries(data)) {
    if (field === 'detail' || field === 'non_field_errors') continue
    if (Array.isArray(errors) && errors.length > 0 && typeof errors[0] === 'string') {
      const label = field.replace(/_/g, ' ')
      return `${label.charAt(0).toUpperCase() + label.slice(1)}: ${errors[0]}`
    }
  }

  return null
}

// ── Main export ───────────────────────────────────────────────────────────────
export function handleApiError(err: unknown, fallback = 'An unexpected error occurred.'): void {
  // No network connection or request never left the browser
  if (!navigator.onLine) {
    toast.error('No internet connection. Please check your network and try again.')
    return
  }

  // Axios errors have a `response` property; check for it structurally
  if (isAxiosError(err)) {
    const { response } = err

    // No response received — server unreachable or CORS issue
    if (!response) {
      toast.error('Could not reach the server. Please check your connection or try again later.')
      return
    }

    const { status, data } = response

    // Try to extract a DRF message from the response body
    if (data && typeof data === 'object') {
      const drfMessage = extractDrfMessage(data as DrfErrorResponse)
      if (drfMessage) {
        toast.error(drfMessage)
        return
      }
    }

    // Fall back to the HTTP status message
    const statusMessage = STATUS_MESSAGES[status]
    if (statusMessage) {
      toast.error(statusMessage)
      return
    }

    // Generic HTTP error with status code
    toast.error(`Request failed (${status}). Please try again.`)
    return
  }

  // Plain JS Error (e.g. thrown directly in service code)
  if (err instanceof Error && err.message) {
    // Do not surface internal messages like "not yet connected to backend"
    if (err.message.includes('not yet connected')) {
      toast.error('This feature is not yet available.')
      return
    }
    toast.error(err.message)
    return
  }

  toast.error(fallback)
}

// ── Type guard for axios-shaped errors (avoids importing axios directly) ──────
function isAxiosError(err: unknown): err is {
  response?: { status: number; data: unknown }
  request?: unknown
  message: string
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    ('response' in err || 'request' in err)
  )
}
