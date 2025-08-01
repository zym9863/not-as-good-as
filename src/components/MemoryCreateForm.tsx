import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/store'

export default function MemoryCreateForm() {
  const navigate = useNavigate()
  const { actions } = useApp()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    weather: '',
    mood: '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const memory = await actions.createMemory({
        title: formData.title.trim(),
        content: formData.content.trim(),
        contentType: 'text',
        status: 'active',
        meta: {
          location: formData.location.trim() || undefined,
          weather: formData.weather.trim() || undefined,
          mood: formData.mood.trim() || undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
        }
      })
      navigate(`/memories/${memory.id}`)
    } catch (error) {
      console.error('创建回忆失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="memory-create-form">
      <div className="form-group">
        <label htmlFor="title">标题 *</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="为这段回忆起个名字"
          required
          aria-describedby={!formData.title.trim() ? 'title-error' : undefined}
        />
        {!formData.title.trim() && (
          <div id="title-error" className="error-message" role="alert">
            请输入标题
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="content">内容 *</label>
        <textarea
          id="content"
          value={formData.content}
          onChange={handleChange('content')}
          placeholder="记录下这段美好的回忆..."
          rows={8}
          required
          aria-describedby={!formData.content.trim() ? 'content-error' : undefined}
        />
        {!formData.content.trim() && (
          <div id="content-error" className="error-message" role="alert">
            请输入内容
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location">地点</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={handleChange('location')}
            placeholder="在哪里"
          />
        </div>

        <div className="form-group">
          <label htmlFor="weather">天气</label>
          <input
            id="weather"
            type="text"
            value={formData.weather}
            onChange={handleChange('weather')}
            placeholder="什么天气"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mood">心情</label>
          <input
            id="mood"
            type="text"
            value={formData.mood}
            onChange={handleChange('mood')}
            placeholder="当时的心情"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">标签</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange('tags')}
            placeholder="用逗号分隔，如：友情,旅行"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => navigate('/memories')}
          className="btn btn-secondary"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? '保存中...' : '保存回忆'}
        </button>
      </div>
    </form>
  )
}