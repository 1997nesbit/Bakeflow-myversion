'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Bell } from 'lucide-react'
import Link from 'next/link'

interface Props {
  overdueCount: number
  incomingCount: number
}

export function DashboardAlertBanners({ overdueCount, incomingCount }: Props) {
  return (
    <>
      {overdueCount > 0 && (
        <div style={{ background: '#CA0123' }} className="px-6 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            <p className="text-sm font-semibold text-white">
              {overdueCount} order{overdueCount > 1 ? 's' : ''} overdue!
            </p>
            <Link href="/baker/active" className="ml-auto">
              <Button size="sm" variant="secondary" className="bg-white text-[#CA0123] hover:bg-red-50 border-0">
                View Now
              </Button>
            </Link>
          </div>
        </div>
      )}
      {incomingCount > 0 && (
        <div style={{ background: '#e66386' }} className="px-6 py-3">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-white animate-bounce" />
            <p className="text-sm font-semibold text-white">
              {incomingCount} new order{incomingCount > 1 ? 's' : ''} from Front Desk -- any baker can accept
            </p>
            <Link href="/baker/active" className="ml-auto">
              <Button size="sm" className="bg-white text-[#e66386] hover:bg-pink-50 border-0">
                Accept
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
