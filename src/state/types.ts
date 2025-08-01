export type MemoryStatus = 'active' | 'sealed'

export type MemoryContentType = 'text' | 'image' | 'audio'

export interface MemoryMeta {
  tags?: string[]
  location?: string
  weather?: string
  mood?: string
}

export interface Memory {
  id: string
  title: string
  content: string
  contentType: MemoryContentType
  status: MemoryStatus
  createdAt: Date
  updatedAt: Date
  sealedUntil?: Date
  meta?: MemoryMeta
  blobIds?: string[]
}

export interface BlobRecord {
  id: string
  memoryId: string
  type: 'image' | 'audio'
  mimeType: string
  size: number
  data: Blob
  createdAt: Date
}

export interface FirstEncounter {
  id: 'first-encounter'
  isLocked: boolean
  time?: string
  location?: string
  weather?: string
  dialogues?: string[]
  mood?: string
  story?: string
  createdAt?: Date
  lockedAt?: Date
}

export interface AppState {
  memories: Memory[]
  firstEncounter?: FirstEncounter
  loading: boolean
  error?: string
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_MEMORIES'; payload: Memory[] }
  | { type: 'ADD_MEMORY'; payload: Memory }
  | { type: 'UPDATE_MEMORY'; payload: Memory }
  | { type: 'DELETE_MEMORY'; payload: string }
  | { type: 'SET_FIRST_ENCOUNTER'; payload: FirstEncounter }