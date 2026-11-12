import { create } from "zustand"

interface AppState {
  patientCount: number
  selectedSpecialty: string
  setSelectedSpecialty: (specialty: string) => void
  incrementPatients: () => void
}

export const useAppStore = create<AppState>((set) => ({
  patientCount: 12,
  selectedSpecialty: "Geral",
  setSelectedSpecialty: (specialty) => set({ selectedSpecialty: specialty }),
  incrementPatients: () => set((state) => ({ patientCount: state.patientCount + 1 })),
}))
