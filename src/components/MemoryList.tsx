import type { Memory } from '../state/types'
import MemoryCard from './MemoryCard'

interface MemoryListProps {
  memories: Memory[]
}

export default function MemoryList({ memories }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="memory-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>还没有回忆</h3>
          <p>开始记录你的第一段回忆吧</p>
          <a href="/memories/new" className="btn btn-primary">
            新建回忆
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="memory-list">
      <div className="memory-grid">
        {memories.map(memory => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </div>
  )
}