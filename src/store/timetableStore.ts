import { create } from 'zustand'

type TimetableView = 'class' | 'teacher' | 'room' | 'subject' | 'student' | 'master'

interface TimetableStore {
  activeTimetableId: string | null
  activeTermId: string | null
  activeView: TimetableView
  setActiveTimetable: (id: string) => void
  setActiveView: (view: TimetableView) => void
}

export const useTimetableStore = create<TimetableStore>((set) => ({
  activeTimetableId: null,
  activeTermId: null,
  activeView: 'class',
  setActiveTimetable: (activeTimetableId) => set({ activeTimetableId }),
  setActiveView: (activeView) => set({ activeView }),
}))
