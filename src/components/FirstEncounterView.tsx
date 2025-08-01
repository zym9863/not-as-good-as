import type { FirstEncounter } from '../state/types'

interface FirstEncounterViewProps {
  encounter: FirstEncounter
}

export default function FirstEncounterView({ encounter }: FirstEncounterViewProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="first-encounter-view">
      <div className="encounter-header">
        <div className="lock-indicator">
          <span className="lock-icon">🔒</span>
          <span className="lock-text">已锁定的回忆</span>
        </div>
        {encounter.lockedAt && (
          <div className="lock-date">
            锁定于 {formatDate(encounter.lockedAt)}
          </div>
        )}
      </div>

      <article className="encounter-content">
        {encounter.time && (
          <div className="encounter-section">
            <h3 className="section-title">时间</h3>
            <p className="section-content">{encounter.time}</p>
          </div>
        )}

        {encounter.location && (
          <div className="encounter-section">
            <h3 className="section-title">地点</h3>
            <p className="section-content">📍 {encounter.location}</p>
          </div>
        )}

        {encounter.weather && (
          <div className="encounter-section">
            <h3 className="section-title">天气</h3>
            <p className="section-content">🌤️ {encounter.weather}</p>
          </div>
        )}

        {encounter.dialogues && encounter.dialogues.length > 0 && (
          <div className="encounter-section">
            <h3 className="section-title">对话</h3>
            <div className="dialogues-display">
              {encounter.dialogues.map((dialogue, index) => (
                <div key={index} className="dialogue-item">
                  <span className="dialogue-marker">💬</span>
                  <span className="dialogue-text">{dialogue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {encounter.mood && (
          <div className="encounter-section">
            <h3 className="section-title">心情</h3>
            <p className="section-content">💭 {encounter.mood}</p>
          </div>
        )}

        {encounter.story && (
          <div className="encounter-section story-section">
            <h3 className="section-title">故事</h3>
            <div className="story-content">
              {encounter.story.split('\n').map((paragraph, index) => (
                <p key={index} className="story-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        <footer className="encounter-footer">
          <div className="creation-info">
            {encounter.createdAt && (
              <p className="created-date">
                创建于 {formatDate(encounter.createdAt)}
              </p>
            )}
            <p className="encounter-note">
              这段初遇的回忆已被永远珍藏
            </p>
          </div>
        </footer>
      </article>
    </div>
  )
}