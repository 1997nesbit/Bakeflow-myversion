'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp, RefreshCw, Receipt } from 'lucide-react'

interface Props {
  thisMonth: number
  lastMonth: number
  recurringTotal: number
  recurringCount: number
  totalExpenses: number
  totalCount: number
}

export function ExpenseSummaryCards({ thisMonth, lastMonth, recurringTotal, recurringCount, totalExpenses, totalCount }: Props) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <p className="text-2xl font-bold text-foreground">TZS {thisMonth.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">February 2026</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">Last Month</p>
          </div>
          <p className="text-2xl font-bold text-foreground">TZS {lastMonth.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">January 2026</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Recurring</p>
          </div>
          <p className="text-2xl font-bold text-foreground">TZS {recurringTotal.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{recurringCount} recurring costs</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Receipt className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-muted-foreground">Total Tracked</p>
          </div>
          <p className="text-2xl font-bold text-foreground">TZS {totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalCount} stock expense records</p>
        </CardContent>
      </Card>
    </div>
  )
}
