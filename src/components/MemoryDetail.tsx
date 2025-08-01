import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/store'
import type { Memory } from '../state/types'
import SealDialog from './SealDialog'
import LetGoDialog from './LetGoDialog'

interface MemoryDetailProps {
  memoryId: string
}

export default function MemoryDetail({ memoryId }: MemoryDetailProps) {
  const navigate = useNavigate()
  const { state } = useApp()
  const [memory, setMemory] = useState<Memory | null>(null)
  const [isSealDialogOpen, setIsSealDialogOpen] = useState(false)
  const [isLetGoDialogOpen, setIsLetGoDialogOpen] = useState(false)

  useEffect(() => {
    const foundMemory = state.memories.find(m => m.id === memoryId)
    if (foundMemory) {
      setMemory(foundMemory)
    } else {
      navigate('/memories')
    }
  }, [memoryId, state.memories, navigate])

  if (!memory) {
    return <div className="loading">加载中...</div>
  }

  const isSealed = memory.status === 'sealed'
  const sealedUntil = memory.sealedUntil

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSealDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isSealed && sealedUntil) {
    return (
      <div className="memory-detail sealed-memory">
        <div className="memory-actions">
          <button
            onClick={() => navigate('/memories')}
            className="btn btn-secondary"
          >
            ← 返回列表
          </button>
        </div>

        <div className="sealed-display">
          <div className="sealed-icon">🔒</div>
          <h1 className="sealed-title">封存的回忆</h1>
          <p className="sealed-description">
            这段回忆已被封存，将在指定时间自动解封
          </p>
          <div className="sealed-info">
            <div className="sealed-date">
              解封时间：{formatSealDate(sealedUntil)}
            </div>
            <div className="created-date">
              创建时间：{formatDate(memory.createdAt)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="memory-detail active-memory">
      <div className="memory-actions">
        <button
          onClick={() => navigate('/memories')}
          className="btn btn-secondary"
        >
          ← 返回列表
        </button>
        <div className="action-buttons">
          <button
            onClick={() => setIsSealDialogOpen(true)}
            className="btn btn-outline"
          >
            封存回忆
          </button>
          <button
            onClick={() => setIsLetGoDialogOpen(true)}
            className="btn btn-danger"
          >
            让它漂流
          </button>
        </div>
      </div>

      <article className="memory-content">
        <header className="memory-header">
          <h1 className="memory-title">{memory.title}</h1>
          <time className="memory-date" dateTime={memory.createdAt.toISOString()}>
            {formatDate(memory.createdAt)}
          </time>
        </header>

        <div className="memory-body">
          <div className="memory-text">
            {memory.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {memory.meta && (
          <footer className="memory-meta">
            <div className="meta-grid">
              {memory.meta.location && (
                <div className="meta-item">
                  <span className="meta-label">地点</span>
                  <span className="meta-value">📍 {memory.meta.location}</span>
                </div>
              )}
              {memory.meta.weather && (
                <div className="meta-item">
                  <span className="meta-label">天气</span>
                  <span className="meta-value">🌤️ {memory.meta.weather}</span>
                </div>
              )}
              {memory.meta.mood && (
                <div className="meta-item">
                  <span className="meta-label">心情</span>
                  <span className="meta-value">💭 {memory.meta.mood}</span>
                </div>
              )}
              {memory.meta.tags && memory.meta.tags.length > 0 && (
                <div className="meta-item tags-item">
                  <span className="meta-label">标签</span>
                  <div className="meta-tags">
                    {memory.meta.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </footer>
        )}
      </article>

      <SealDialog
        memoryId={memory.id}
        isOpen={isSealDialogOpen}
        onClose={() => setIsSealDialogOpen(false)}
        onSealed={() => {
          setIsSealDialogOpen(false)
        }}
      />

      <LetGoDialog
        memoryId={memory.id}
        memoryTitle={memory.title}
        isOpen={isLetGoDialogOpen}
        onClose={() => setIsLetGoDialogOpen(false)}
        onDeleted={() => {
          navigate('/memories')
        }}
      />
    </div>
  )
}