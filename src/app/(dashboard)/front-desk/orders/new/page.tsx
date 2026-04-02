import { NewOrderPage } from '@/components/portals/front-desk/orders/NewOrderPage'

interface Props {
  searchParams: Promise<{ mode?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { mode } = await searchParams
  return <NewOrderPage mode={mode === 'custom' ? 'custom' : 'menu'} />
}
