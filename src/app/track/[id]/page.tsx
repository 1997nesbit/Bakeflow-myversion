import { ordersService } from '@/lib/api/services/orders'
import { OrderTracking } from '@/components/public/OrderTracking'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Track order ${id} — Bakeflow` }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await ordersService.getByTrackingId(id).catch(() => null)
  return <OrderTracking initialOrder={order} trackingId={id} />
}
