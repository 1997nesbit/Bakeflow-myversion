'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackagePlus, Calendar, Building2, FileText } from 'lucide-react'
import type { StockEntry } from '@/types/inventory'

interface Props {
  filteredEntries: StockEntry[]
}

export function StockEntriesTable({ filteredEntries }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {['Date', 'Product', 'Supplier', 'Qty', 'Unit Cost', 'Total', 'Invoice', 'Added By'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${['Qty', 'Unit Cost', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{entry.date}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-foreground">{entry.itemName}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{entry.supplierName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge className="bg-emerald-100 text-emerald-800 border-0">
                      +{entry.quantity} {entry.itemUnit}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">{Number(entry.costPerUnit).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">{Number(entry.totalCost).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {entry.invoiceRef ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{entry.invoiceRef}</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{entry.addedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && (
            <div className="py-12 text-center">
              <PackagePlus className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No stock entries found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
