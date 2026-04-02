'use client'

import type { ReactNode } from 'react'
import { useState, useMemo } from 'react'
import { bakeryMenu } from '@/data/constants/menus'
import type { MenuItem } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, UtensilsCrossed, Tag, Clock, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { MenuItemFormDialog } from '@/components/shared/MenuItemFormDialog'

interface MenuManagementProps {
  sidebar: ReactNode
  /** 'dark' = manager portal theme; 'light' = front-desk theme */
  theme: 'light' | 'dark'
}

function uniqueSorted(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort()
}

export function MenuManagement({ sidebar, theme }: MenuManagementProps) {
  const [items, setItems] = useState<MenuItem[]>(bakeryMenu)
  /** Categories that exist but have no items yet (added via the Categories tab) */
  const [emptyCats, setEmptyCats] = useState<string[]>([])
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')

  // Item dialog
  const [itemDialog, setItemDialog] = useState<{ open: boolean; item?: MenuItem }>({ open: false })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Category dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [renameCat, setRenameCat] = useState<{ old: string; val: string } | null>(null)

  const itemCats = uniqueSorted(items.map(i => i.category))
  const categories = uniqueSorted([...itemCats, ...emptyCats])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)
    if (q) result = result.filter(i =>
      i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    )
    return result
  }, [items, filterCat, search])

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const dk = theme === 'dark'
  const bg    = dk ? 'bg-manager-bg'                    : 'bg-background'
  const card  = dk ? 'bg-white/[0.02] border-white/5'   : 'bg-card border-border'
  const tx    = dk ? 'text-white'                        : 'text-foreground'
  const mu    = dk ? 'text-white/50'                     : 'text-muted-foreground'
  const ac    = dk ? 'bg-manager-accent hover:bg-manager-accent/85 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
  const inp   = dk ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : ''
  const dbg   = dk ? 'bg-manager-card border-white/10 text-white' : ''
  const lbl   = dk ? 'text-white/60' : ''
  const ghost = dk ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground'
  const del   = dk ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10' : 'text-muted-foreground hover:text-destructive'
  const chipOn  = dk ? 'bg-white/15 text-white border-white/25' : 'bg-primary text-primary-foreground border-primary'
  const chipOff = dk ? 'text-white/50 border-white/10 hover:text-white/80' : 'text-muted-foreground border-border hover:text-foreground'

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSaveItem(data: Omit<MenuItem, 'id'>, id?: string) {
    if (id) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
      toast.success('Menu item updated.')
    } else {
      setItems(prev => [...prev, { id: `M-${Date.now().toString().slice(-7)}`, ...data }])
      setEmptyCats(prev => prev.filter(c => c !== data.category))
      toast.success('Menu item added.')
    }
    setItemDialog({ open: false })
  }

  function handleDeleteItem() {
    if (!deleteId) return
    setItems(prev => prev.filter(i => i.id !== deleteId))
    setDeleteId(null)
    toast.success('Item removed.')
  }

  function handleAddCat() {
    const slug = newCatName.trim().toLowerCase()
    if (!slug) { toast.warning('Enter a category name.'); return }
    if (categories.includes(slug)) { toast.warning('Category already exists.'); return }
    setEmptyCats(prev => [...prev, slug])
    setNewCatName('')
    setCatDialogOpen(false)
    toast.success('Category added.')
  }

  function handleRenameCat() {
    if (!renameCat) return
    const slug = renameCat.val.trim().toLowerCase()
    if (!slug) return
    if (slug !== renameCat.old && categories.includes(slug)) { toast.warning('A category with that name already exists.'); return }
    setItems(prev => prev.map(i => i.category === renameCat.old ? { ...i, category: slug } : i))
    setEmptyCats(prev => prev.map(c => c === renameCat.old ? slug : c))
    setRenameCat(null)
    toast.success('Category renamed.')
  }

  function handleDeleteCat(cat: string) {
    const count = items.filter(i => i.category === cat).length
    if (count > 0) { toast.error(`Cannot delete — ${count} item${count > 1 ? 's' : ''} use this category.`); return }
    setEmptyCats(prev => prev.filter(c => c !== cat))
    toast.success('Category removed.')
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${bg}`}>
      {sidebar}
      <main className="ml-64 p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${tx}`}>Menu Management</h1>
          <p className={`text-sm ${mu}`}>{items.length} items · {categories.length} categories</p>
        </div>

        <Tabs defaultValue="items">
          <TabsList className={`mb-5 ${dk ? 'bg-white/5 border border-white/10' : ''}`}>
            <TabsTrigger value="items" className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-3.5 w-3.5" /> Menu Items
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Item Types
            </TabsTrigger>
          </TabsList>

          {/* ── Menu Items ── */}
          <TabsContent value="items">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              {/* Search */}
              <div className={`relative flex items-center w-64`}>
                <Search className={`absolute left-3 h-3.5 w-3.5 pointer-events-none ${mu}`} />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className={`pl-8 pr-8 h-8 text-xs ${inp}`}
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')}
                    className={`absolute right-2.5 ${mu} hover:opacity-100 opacity-60`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button onClick={() => setItemDialog({ open: true })} className={ac}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Item
              </Button>
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {(['all', ...categories] as string[]).map(cat => (
                <button
                  key={cat} type="button" onClick={() => setFilterCat(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterCat === cat ? chipOn : chipOff}`}
                >
                  {cat === 'all'
                    ? `All (${items.length})`
                    : `${cat} (${items.filter(i => i.category === cat).length})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className={`text-center py-20 ${mu}`}>
                <UtensilsCrossed className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{search ? `No items match "${search}".` : 'No items in this category.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(item => (
                  <div key={item.id} className={`rounded-xl border p-4 ${card}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${tx}`}>{item.name}</p>
                        <Badge className={`text-[10px] mt-0.5 px-1.5 py-0 border-0 capitalize ${dk ? 'bg-white/10 text-white/60' : 'bg-secondary text-secondary-foreground'}`}>
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${ghost}`}
                          onClick={() => setItemDialog({ open: true, item })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${del}`}
                          onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {item.description && (
                      <p className={`text-xs mb-2 ${mu}`}>{item.description}</p>
                    )}
                    <div className={`flex items-center gap-4 text-xs ${mu}`}>
                      <span>TZS {item.price.toLocaleString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{item.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Item Types ── */}
          <TabsContent value="categories">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${mu}`}>{categories.length} categories</p>
              <Button onClick={() => { setNewCatName(''); setCatDialogOpen(true) }} className={ac}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Category
              </Button>
            </div>

            {categories.length === 0 ? (
              <div className={`text-center py-20 ${mu}`}>
                <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No categories yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => {
                  const count = items.filter(i => i.category === cat).length
                  return (
                    <div key={cat} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${card}`}>
                      <Tag className={`h-4 w-4 shrink-0 ${mu}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium capitalize ${tx}`}>{cat}</p>
                        <p className={`text-xs ${mu}`}>{count} item{count !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className={`h-7 text-xs ${ghost}`}
                          onClick={() => setRenameCat({ old: cat, val: cat })}>
                          <Pencil className="h-3 w-3 mr-1" /> Rename
                        </Button>
                        <Button size="sm" variant="ghost" className={`h-7 text-xs ${del}`}
                          onClick={() => handleDeleteCat(cat)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Item Form Dialog ── */}
        <MenuItemFormDialog
          open={itemDialog.open}
          onOpenChange={open => setItemDialog({ open })}
          item={itemDialog.item}
          categories={categories}
          onSave={handleSaveItem}
          inputClass={inp}
          labelClass={lbl}
          dialogBg={dbg}
          accentClass={ac}
        />

        {/* ── Delete Confirm ── */}
        <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
          <DialogContent className={`sm:max-w-sm ${dbg}`}>
            <DialogHeader><DialogTitle>Remove Menu Item</DialogTitle></DialogHeader>
            <p className={`text-sm ${mu}`}>Are you sure? This will remove the item from the menu.</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}
                className={`flex-1 ${dk ? 'border-white/10 text-white hover:bg-white/5' : ''}`}>
                Cancel
              </Button>
              <Button onClick={handleDeleteItem} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">
                Remove
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Add Category ── */}
        <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
          <DialogContent className={`sm:max-w-sm ${dbg}`}>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className={lbl}>Category Name *</Label>
                <Input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  className={`mt-1 ${inp}`} placeholder="e.g. seasonal"
                  onKeyDown={e => e.key === 'Enter' && handleAddCat()} />
              </div>
              <Button onClick={handleAddCat} className={`w-full ${ac}`}>Add Category</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Rename Category ── */}
        <Dialog open={!!renameCat} onOpenChange={open => !open && setRenameCat(null)}>
          <DialogContent className={`sm:max-w-sm ${dbg}`}>
            <DialogHeader><DialogTitle>Rename Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className={lbl}>New Name *</Label>
                <Input
                  value={renameCat?.val ?? ''}
                  onChange={e => setRenameCat(prev => prev ? { ...prev, val: e.target.value } : null)}
                  className={`mt-1 ${inp}`}
                  onKeyDown={e => e.key === 'Enter' && handleRenameCat()}
                />
              </div>
              <Button onClick={handleRenameCat} className={`w-full ${ac}`}>Rename</Button>
            </div>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  )
}
