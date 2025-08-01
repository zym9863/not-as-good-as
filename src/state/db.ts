import Dexie, { type Table } from 'dexie'
import type { Memory, BlobRecord, FirstEncounter } from './types'

export class MemoryDatabase extends Dexie {
  records!: Table<Memory>
  blobs!: Table<BlobRecord>
  settings!: Table<FirstEncounter>

  constructor() {
    super('MemoryDatabase')
    this.version(1).stores({
      records: 'id, status, createdAt, sealedUntil',
      blobs: 'id, memoryId, type, createdAt',
      settings: 'id'
    })
  }
}

export const db = new MemoryDatabase()

export class DatabaseService {
  static async getAllMemories(): Promise<Memory[]> {
    const memories = await db.records.orderBy('createdAt').reverse().toArray()
    return memories.map(memory => ({
      ...memory,
      status: memory.sealedUntil && memory.sealedUntil > new Date() ? 'sealed' : 'active'
    }))
  }

  static async getMemoryById(id: string): Promise<Memory | undefined> {
    const memory = await db.records.get(id)
    if (!memory) return undefined
    
    return {
      ...memory,
      status: memory.sealedUntil && memory.sealedUntil > new Date() ? 'sealed' : 'active'
    }
  }

  static async createMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const newMemory: Memory = {
      ...memory,
      id,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    }

    await db.records.add(newMemory)
    return newMemory
  }

  static async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | undefined> {
    const memory = await db.records.get(id)
    if (!memory) return undefined

    const updatedMemory = {
      ...memory,
      ...updates,
      updatedAt: new Date()
    }

    await db.records.put(updatedMemory)
    return {
      ...updatedMemory,
      status: updatedMemory.sealedUntil && updatedMemory.sealedUntil > new Date() ? 'sealed' : 'active'
    }
  }

  static async deleteMemory(id: string): Promise<void> {
    await db.transaction('rw', db.records, db.blobs, async () => {
      await db.records.delete(id)
      await db.blobs.where('memoryId').equals(id).delete()
    })
  }

  static async sealMemory(id: string, sealedUntil: Date): Promise<Memory | undefined> {
    return this.updateMemory(id, { sealedUntil })
  }

  static async unsealMemory(id: string): Promise<Memory | undefined> {
    return this.updateMemory(id, { sealedUntil: undefined })
  }

  static async getFirstEncounter(): Promise<FirstEncounter | undefined> {
    return await db.settings.get('first-encounter')
  }

  static async saveFirstEncounter(encounter: FirstEncounter): Promise<void> {
    await db.settings.put(encounter)
  }

  static async lockFirstEncounter(): Promise<void> {
    const encounter = await this.getFirstEncounter()
    if (encounter && !encounter.isLocked) {
      await db.settings.put({
        ...encounter,
        isLocked: true,
        lockedAt: new Date()
      })
    }
  }

  static async saveBlobRecord(blobRecord: Omit<BlobRecord, 'id' | 'createdAt'>): Promise<BlobRecord> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const newBlobRecord: BlobRecord = {
      ...blobRecord,
      id,
      createdAt: now
    }

    await db.blobs.add(newBlobRecord)
    return newBlobRecord
  }

  static async getBlobsByMemoryId(memoryId: string): Promise<BlobRecord[]> {
    return await db.blobs.where('memoryId').equals(memoryId).toArray()
  }

  static async deleteBlobsByMemoryId(memoryId: string): Promise<void> {
    await db.blobs.where('memoryId').equals(memoryId).delete()
  }
}