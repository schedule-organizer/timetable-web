import { create } from 'zustand'

interface NotificationStore {
  unreadCount: number
  incrementUnread: () => void
  resetUnread: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}))
