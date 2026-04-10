export type ChecklistAnswer = 'yes' | 'no' | 'na' | null

export interface ChecklistState {
  [itemId: string]: ChecklistAnswer
}

export interface OffShelfEntry {
  id: string
  location: string
  category: string
  product: string
  quantity: number | string
}

export interface AppState {
  checklist: ChecklistState
  offShelf: OffShelfEntry[]
  photoCaption: string
  notes: string
  revisitRequired: boolean
  shelfResetNeeded: boolean
  trellisEnabled: boolean
}
