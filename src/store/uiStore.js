import { create } from 'zustand'

const useUiStore = create((set) => ({
  notifVersion: 0,
  triggerNotifRefresh: () => set(s => ({ notifVersion: s.notifVersion + 1 })),
}))

export default useUiStore
