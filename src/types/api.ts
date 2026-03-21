/**
 * Utility types for API communication with the Django REST Framework backend.
 * These are not domain models — they describe the HTTP transport layer.
 */

/**
 * Standard DRF paginated list response shape.
 * All list endpoints return this wrapper (default 25 per page, max 100).
 *
 * Usage in a service:
 *   return (await apiClient.get<PaginatedResponse<Order>>('/orders/')).data
 *
 * Usage in a component:
 *   const [orders, setOrders] = useState<Order[]>([])
 *   ordersService.getAll().then(res => setOrders(res.results))
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
