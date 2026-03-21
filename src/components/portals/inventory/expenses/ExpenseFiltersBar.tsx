'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, CalendarDays, ArrowUpDown, Download } from 'lucide-react'
import { expenseCategories } from '@/data/constants/categories'

interface Props {
  searchQuery: string
  filterCategory: string
  filterMonth: string
  sortBy: 'date' | 'amount'
  sortDir: 'asc' | 'desc'
  filteredCount: number
  filteredTotal: number
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onMonthChange: (v: string) => void
  onSortByChange: (v: 'date' | 'amount') => void
  onSortDirToggle: () => void
}

export function ExpenseFiltersBar({
  searchQuery, filterCategory, filterMonth, sortBy, sortDir,
  filteredCount, filteredTotal,
  onSearchChange, onCategoryChange, onMonthChange, onSortByChange, onSortDirToggle,
}: Props) {
  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stock expenses..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label.split('&')[0].trim()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[160px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="2026-02">February 2026</SelectItem>
                <SelectItem value="2026-01">January 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent" onClick={onSortDirToggle}>
              <ArrowUpDown className="mr-1.5 h-4 w-4" />
              {sortBy === 'date' ? 'Date' : 'Amount'}
            </Button>
            <Select value={sortBy} onValueChange={(v) => onSortByChange(v as 'date' | 'amount')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {filteredCount} expense{filteredCount === 1 ? '' : 's'} found
          {filteredCount > 0 && ` - Total: $${filteredTotal.toLocaleString()}`}
        </p>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          <Download className="mr-1.5 h-3 w-3" />
          Export
        </Button>
      </div>
    </>
  )
}
