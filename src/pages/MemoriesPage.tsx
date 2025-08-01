import { useState } from 'react'
import { useApp } from '../state/store'
import MemoryList from '../components/MemoryList'

export default function MemoriesPage() {
  const { state } = useApp()
  const [showSealed, setShowSealed] = useState(false)

  const filteredMemories = state.memories.filter(memory => 
    showSealed || memory.status === 'active'
  )

  return (
    <div className="memories-page">
      <div className="memories-header">
        <h1>回忆集</h1>
        <div className="memories-controls">
          <label className="show-sealed-toggle">
            <input
              type="checkbox"
              checked={showSealed}
              onChange={(e) => setShowSealed(e.target.checked)}
            />
            显示封存回忆
          </label>
          <a href="/memories/new" className="btn btn-primary">新建回忆</a>
        </div>
      </div>
      
      {state.loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <MemoryList memories={filteredMemories} />
      )}
    </div>
  )
}