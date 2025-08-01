import { Link } from 'react-router-dom'
import type { Memory } from '../state/types'

interface MemoryCardProps {
  memory: Memory
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  const isSealed = memory.status === 'sealed'
  const sealedUntil = memory.sealedUntil

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSealDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isSealed && sealedUntil) {
    return (
      <div className="memory-card sealed-card">
        <div className="sealed-overlay">
          <div className="sealed-content">
            <div className="sealed-icon">🔒</div>
            <h3 className="sealed-title">封存的回忆</h3>
            <p className="sealed-date">
              将在 {formatSealDate(sealedUntil)} 解封
            </p>
            <div className="sealed-meta">
              创建于 {formatDate(memory.createdAt)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/memories/${memory.id}`} className="memory-card active-card">
      <div className="memory-header">
        <h3 className="memory-title">{memory.title}</h3>
        <div className="memory-date">
          {formatDate(memory.createdAt)}
        </div>
      </div>
      
      <div className="memory-preview">
        <p className="memory-content">
          {memory.content.length > 150 
            ? `${memory.content.substring(0, 150)}...` 
            : memory.content
          }
        </p>
      </div>

      {memory.meta && (
        <div className="memory-meta">
          {memory.meta.location && (
            <span className="meta-item location">
              📍 {memory.meta.location}
            </span>
          )}
          {memory.meta.weather && (
            <span className="meta-item weather">
              🌤️ {memory.meta.weather}
            </span>
          )}
          {memory.meta.mood && (
            <span className="meta-item mood">
              💭 {memory.meta.mood}
            </span>
          )}
          {memory.meta.tags && memory.meta.tags.length > 0 && (
            <div className="meta-tags">
              {memory.meta.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}