'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { mockDebts, type DebtRecord } from '@/lib/mock-data'
import { Banknote, AlertTriangle, Phone, Clock, CheckCircle2, Search } from 'lucide-react'

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtRecord[]>(mockDebts)
  const [search, setSearch] = useState('')
  const [payDebt, setPayDebt] = useState<DebtRecord | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
  const overdueCount = debts.filter(d => d.status === 'overdue').length
  const filtered = debts.filter(d => d.customerName.toLowerCase().includes(search.toLowerCase()) || d.orderId.includes(search))

  const statusStyle: Record<string, string> = {
    overdue: 'bg-red-500/20 text-red-300', partial: 'bg-amber-500/20 text-amber-300', pending: 'bg-blue-500/20 text-blue-300',
  }

  const handlePay = () => {
    if (!payDebt || !payAmount) return
    const amt = Number(payAmount)
    setDebts(debts.map(d => {
      if (d.id !== payDebt.id) return d
      const newPaid = d.amountPaid + amt
      const newBal = d.totalAmount - newPaid
      return { ...d, amountPaid: newPaid, balance: Math.max(newBal, 0), status: newBal <= 0 ? 'pending' as const : 'partial' as const }
    }).filter(d => d.balance > 0))
    setPayDebt(null)
    setPayAmount('')
  }

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Debts</h1>
          <p className="text-sm text-white/40">Outstanding customer balances and overdue payments</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CA0123]/10"><Banknote className="h-4 w-4 text-[#e66386]" /></div>
              <span className="text-xs text-white/40">Total Outstanding</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {totalDebt.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10"><AlertTriangle className="h-4 w-4 text-red-400" /></div>
              <span className="text-xs text-white/40">Overdue</span>
            </div>
            <p className="text-xl font-bold text-red-400">{overdueCount}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"><Clock className="h-4 w-4 text-amber-400" /></div>
              <span className="text-xs text-white/40">Active Debts</span>
            </div>
            <p className="text-xl font-bold text-white">{debts.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or order..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        </div>

        {/* Debt list */}
        <div className="space-y-2">
          {filtered.length === 0 && <div className="text-center py-12 text-white/30"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-400/40" /><p>No outstanding debts</p></div>}
          {filtered.map((d) => (
            <div key={d.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{d.customerName}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusStyle[d.status]}`}>{d.status}</Badge>
                  <span className="text-xs text-white/30">{d.orderId}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.customerPhone}</span>
                  <span>Due: {d.dueDate}</span>
                  <span>Paid: TZS {d.amountPaid.toLocaleString()} of TZS {d.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[#e66386]">TZS {d.balance.toLocaleString()}</p>
                <Button size="sm" className="mt-1 bg-green-600 hover:bg-green-700 text-white text-xs h-7" onClick={() => { setPayDebt(d); setPayAmount(String(d.balance)) }}>
                  Record Payment
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Dialog */}
        <Dialog open={!!payDebt} onOpenChange={() => setPayDebt(null)}>
          <DialogContent className="bg-[#1a0a0e] border-white/10 text-white sm:max-w-sm">
            <DialogHeader><DialogTitle>Record Debt Payment</DialogTitle></DialogHeader>
            {payDebt && (
              <div className="space-y-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">{payDebt.customerName}</p>
                  <p className="text-xs text-white/40">Balance: TZS {payDebt.balance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-white/60">Amount Received (TZS)</label>
                  <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                </div>
                <Button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-700 text-white">Confirm Payment</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
