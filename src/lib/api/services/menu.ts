// ---- MENU SERVICE ----
// Phase 4: Active (read) — menu items and categories are fetched from Django.
// Phase 4 extension (CRUD): createItem, updateItem, deleteItem stubs below —
//   activate once the backend exposes write endpoints.
//
// Django endpoints:
//   GET    /api/menu/              list all active menu items
//   GET    /api/menu/categories/   list distinct category slugs
//   POST   /api/menu/              create a menu item         (TODO Phase 4 ext)
//   PATCH  /api/menu/{id}/         update a menu item         (TODO Phase 4 ext)
//   DELETE /api/menu/{id}/         delete a menu item         (TODO Phase 4 ext)
//   POST   /api/menu/categories/   create a category          (TODO Phase 4 ext)
//   PATCH  /api/menu/categories/{slug}/  rename a category    (TODO Phase 4 ext)
//   DELETE /api/menu/categories/{slug}/  delete a category    (TODO Phase 4 ext)

import type { MenuItem } from '@/types/order'
import { apiClient } from '@/lib/api/client'

export const menuService = {
  /** GET /api/menu/ — returns all active menu items */
  getItems: async (options?: { signal?: AbortSignal }): Promise<MenuItem[]> => {
    return (await apiClient.get<MenuItem[]>('/menu/', { signal: options?.signal })).data
  },

  /** GET /api/menu/categories/ — returns ordered list of distinct category slugs */
  getCategories: async (options?: { signal?: AbortSignal }): Promise<string[]> => {
    return (await apiClient.get<string[]>('/menu/categories/', { signal: options?.signal })).data
  },

  // ── Write operations (Phase 4 extension) ────────────────────────────────────

  /** POST /api/menu/ — create a new menu item */
  createItem: async (data: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    // TODO (Phase 4 ext): return (await apiClient.post<MenuItem>('/menu/', data)).data
    throw new Error('createItem — not yet active (Phase 4 extension)')
  },

  /** PATCH /api/menu/{id}/ — update an existing menu item */
  updateItem: async (id: string, data: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
    // TODO (Phase 4 ext): return (await apiClient.patch<MenuItem>(`/menu/${id}/`, data)).data
    throw new Error('updateItem — not yet active (Phase 4 extension)')
  },

  /** DELETE /api/menu/{id}/ — remove a menu item */
  deleteItem: async (id: string): Promise<void> => {
    // TODO (Phase 4 ext): await apiClient.delete(`/menu/${id}/`)
    throw new Error('deleteItem — not yet active (Phase 4 extension)')
  },

  /** POST /api/menu/categories/ — add a new category */
  createCategory: async (name: string): Promise<string> => {
    // TODO (Phase 4 ext): return (await apiClient.post<{ slug: string }>('/menu/categories/', { name })).data.slug
    throw new Error('createCategory — not yet active (Phase 4 extension)')
  },

  /** PATCH /api/menu/categories/{slug}/ — rename a category (cascades to items on server) */
  renameCategory: async (slug: string, newName: string): Promise<string> => {
    // TODO (Phase 4 ext): return (await apiClient.patch<{ slug: string }>(`/menu/categories/${slug}/`, { name: newName })).data.slug
    throw new Error('renameCategory — not yet active (Phase 4 extension)')
  },

  /** DELETE /api/menu/categories/{slug}/ — delete an empty category */
  deleteCategory: async (slug: string): Promise<void> => {
    // TODO (Phase 4 ext): await apiClient.delete(`/menu/categories/${slug}/`)
    throw new Error('deleteCategory — not yet active (Phase 4 extension)')
  },
}
