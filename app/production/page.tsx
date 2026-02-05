'use client'

import React from "react"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KanbanColumn } from '@/components/production/kanban-column'
import { mockOrders, Order, OrderStatus } from '@/lib/mock-data'
import {
  ChefHat,
  Palette,
  ClipboardCheck,
  Package,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'

type ProductionStage = 'baker' | 'decorator' | 'quality' | 'packing' | 'ready'

const stages: {
  key: ProductionStage
  title: string
  color: string
  icon: React.ReactNode
  nextStage?: ProductionStage
}[] = [
  {
    key: 'baker',
    title: 'Baker',
    color: 'bg-orange-100 text-orange-800',
    icon: <ChefHat className="h-5 w-5" />,
    nextStage: 'decorator',
  },
  {
    key: 'decorator',
    title: 'Decorator',
    color: 'bg-pink-100 text-pink-800',
    icon: <Palette className="h-5 w-5" />,
    nextStage: 'quality',
  },
  {
    key: 'quality',
    title: 'Quality Check',
    color: 'bg-blue-100 text-blue-800',
    icon: <ClipboardCheck className="h-5 w-5" />,
    nextStage: 'packing',
  },
  {
    key: 'packing',
    title: 'Packing',
    color: 'bg-indigo-100 text-indigo-800',
    icon: <Package className="h-5 w-5" />,
    nextStage: 'ready',
  },
  {
    key: 'ready',
    title: 'Ready',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-5 w-5" />,
  },
]

const stageLabels: Record<ProductionStage, string> = {
  baker: 'Baker',
  decorator: 'Decorator',
  quality: 'Quality Check',
  packing: 'Packing',
  ready: 'Ready',
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [roleFilter, setRoleFilter] = useState<ProductionStage | 'all'>('all')

  const moveOrder = (orderId: string, currentStage: ProductionStage) => {
    const stage = stages.find((s) => s.key === currentStage)
    if (!stage?.nextStage) return

    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: stage.nextStage as OrderStatus } : order
      )
    )
  }

  const getOrdersByStage = (stage: ProductionStage) => {
    return orders.filter((order) => order.status === stage)
  }

  const visibleStages =
    roleFilter === 'all'
      ? stages
      : stages.filter((stage) => stage.key === roleFilter)

  const totalInProduction = stages.reduce(
    (sum, stage) => sum + getOrdersByStage(stage.key).length,
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Production Workflow
            </h1>
            <p className="text-muted-foreground">
              {totalInProduction} orders in production
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as ProductionStage | 'all')
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="View as role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="baker">Baker View</SelectItem>
                <SelectItem value="decorator">Decorator View</SelectItem>
                <SelectItem value="quality">Quality Check View</SelectItem>
                <SelectItem value="packing">Packing View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="mb-6 rounded-lg bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {stages.map((stage, index) => (
              <div key={stage.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${stage.color}`}
                  >
                    {stage.icon}
                  </div>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {stage.title}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {getOrdersByStage(stage.key).length}
                  </p>
                </div>
                {index < stages.length - 1 && (
                  <div className="mx-4 h-0.5 w-12 bg-border lg:w-20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-4 overflow-x-auto pb-4 lg:grid-cols-5">
          {visibleStages.map((stage) => (
            <KanbanColumn
              key={stage.key}
              title={stage.title}
              orders={getOrdersByStage(stage.key)}
              color={stage.color}
              icon={stage.icon}
              nextStage={stage.nextStage ? stageLabels[stage.nextStage] : undefined}
              onMoveOrder={
                stage.nextStage
                  ? (orderId) => moveOrder(orderId, stage.key)
                  : undefined
              }
            />
          ))}
        </div>
      </main>
    </div>
  )
}
