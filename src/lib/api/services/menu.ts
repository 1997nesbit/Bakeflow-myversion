// ---- MENU SERVICE ----
// Phase 4: Fully active — all read and write endpoints connected to Django.
//
// Django endpoints:
//   GET    /api/menu/                          list all active menu items
//   POST   /api/menu/                          create a menu item
//   PATCH  /api/menu/{id}/                     update a menu item
//   DELETE /api/menu/{id}/                     soft-delete a menu item
//   GET    /api/menu/categories/               list distinct category slugs
//   POST   /api/menu/categories/               validate + return new category slug
//   PATCH  /api/menu/categories/{slug}/        rename a category (cascades to items)
//   DELETE /api/menu/categories/{slug}/        delete a category (rejected if items exist)

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

  // ── Write operations ─────────────────────────────────────────────────────────

  /** POST /api/menu/ — create a new menu item */
  createItem: async (data: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    return (await apiClient.post<MenuItem>('/menu/', data)).data
  },

  /** PATCH /api/menu/{id}/ — update an existing menu item */
  updateItem: async (id: string, data: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
    return (await apiClient.patch<MenuItem>(`/menu/${id}/`, data)).data
  },

  /** DELETE /api/menu/{id}/ — soft-deletes the item (sets is_active=False on server) */
  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/${id}/`)
  },

  /** POST /api/menu/categories/ — validate and return the new category slug */
  createCategory: async (name: string): Promise<string> => {
    return (await apiClient.post<{ slug: string }>('/menu/categories/', { name })).data.slug
  },

  /** PATCH /api/menu/categories/{slug}/ — rename a category; cascades to all items on server */
  renameCategory: async (slug: string, newName: string): Promise<string> => {
    return (await apiClient.patch<{ slug: string }>(`/menu/categories/${slug}/`, { name: newName })).data.slug
  },

  /** DELETE /api/menu/categories/{slug}/ — delete a category (rejected if items exist) */
  deleteCategory: async (slug: string): Promise<void> => {
    await apiClient.delete(`/menu/categories/${slug}/`)
  },
}
