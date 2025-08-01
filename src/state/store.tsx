import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, AppAction, Memory, FirstEncounter } from './types'
import { DatabaseService } from './db'

const initialState: AppState = {
  memories: [],
  firstEncounter: undefined,
  loading: false,
  error: undefined
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_MEMORIES':
      return { ...state, memories: action.payload }
    case 'ADD_MEMORY':
      return { ...state, memories: [action.payload, ...state.memories] }
    case 'UPDATE_MEMORY':
      return {
        ...state,
        memories: state.memories.map(memory =>
          memory.id === action.payload.id ? action.payload : memory
        )
      }
    case 'DELETE_MEMORY':
      return {
        ...state,
        memories: state.memories.filter(memory => memory.id !== action.payload)
      }
    case 'SET_FIRST_ENCOUNTER':
      return { ...state, firstEncounter: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
  actions: {
    loadMemories: () => Promise<void>
    createMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Memory>
    updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>
    deleteMemory: (id: string) => Promise<void>
    sealMemory: (id: string, sealedUntil: Date) => Promise<void>
    loadFirstEncounter: () => Promise<void>
    saveFirstEncounter: (encounter: FirstEncounter) => Promise<void>
    lockFirstEncounter: () => Promise<void>
  }
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const actions = {
    async loadMemories() {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const memories = await DatabaseService.getAllMemories()
        dispatch({ type: 'SET_MEMORIES', payload: memories })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: String(error) })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    async createMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) {
      const newMemory = await DatabaseService.createMemory(memory)
      dispatch({ type: 'ADD_MEMORY', payload: newMemory })
      return newMemory
    },

    async updateMemory(id: string, updates: Partial<Memory>) {
      const updatedMemory = await DatabaseService.updateMemory(id, updates)
      if (updatedMemory) {
        dispatch({ type: 'UPDATE_MEMORY', payload: updatedMemory })
      }
    },

    async deleteMemory(id: string) {
      await DatabaseService.deleteMemory(id)
      dispatch({ type: 'DELETE_MEMORY', payload: id })
    },

    async sealMemory(id: string, sealedUntil: Date) {
      const sealedMemory = await DatabaseService.sealMemory(id, sealedUntil)
      if (sealedMemory) {
        dispatch({ type: 'UPDATE_MEMORY', payload: sealedMemory })
      }
    },

    async loadFirstEncounter() {
      const encounter = await DatabaseService.getFirstEncounter()
      if (encounter) {
        dispatch({ type: 'SET_FIRST_ENCOUNTER', payload: encounter })
      }
    },

    async saveFirstEncounter(encounter: FirstEncounter) {
      await DatabaseService.saveFirstEncounter(encounter)
      dispatch({ type: 'SET_FIRST_ENCOUNTER', payload: encounter })
    },

    async lockFirstEncounter() {
      await DatabaseService.lockFirstEncounter()
      const updatedEncounter = await DatabaseService.getFirstEncounter()
      if (updatedEncounter) {
        dispatch({ type: 'SET_FIRST_ENCOUNTER', payload: updatedEncounter })
      }
    }
  }

  useEffect(() => {
    actions.loadMemories()
    actions.loadFirstEncounter()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}