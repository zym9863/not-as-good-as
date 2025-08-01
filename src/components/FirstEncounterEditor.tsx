import React, { useState, useEffect } from 'react'
import { useApp } from '../state/store'
import type { FirstEncounter } from '../state/types'

export default function FirstEncounterEditor() {
  const { state, actions } = useApp()
  const [formData, setFormData] = useState({
    time: '',
    location: '',
    weather: '',
    dialogues: [''],
    mood: '',
    story: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showLockDialog, setShowLockDialog] = useState(false)

  useEffect(() => {
    if (state.firstEncounter && !state.firstEncounter.isLocked) {
      const encounter = state.firstEncounter
      setFormData({
        time: encounter.time || '',
        location: encounter.location || '',
        weather: encounter.weather || '',
        dialogues: encounter.dialogues && encounter.dialogues.length > 0 ? encounter.dialogues : [''],
        mood: encounter.mood || '',
        story: encounter.story || ''
      })
    }
  }, [state.firstEncounter])

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleDialogueChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      dialogues: prev.dialogues.map((dialogue, i) => i === index ? value : dialogue)
    }))
  }

  const addDialogue = () => {
    setFormData(prev => ({
      ...prev,
      dialogues: [...prev.dialogues, '']
    }))
  }

  const removeDialogue = (index: number) => {
    if (formData.dialogues.length > 1) {
      setFormData(prev => ({
        ...prev,
        dialogues: prev.dialogues.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const encounter: FirstEncounter = {
        id: 'first-encounter',
        isLocked: false,
        time: formData.time.trim() || undefined,
        location: formData.location.trim() || undefined,
        weather: formData.weather.trim() || undefined,
        dialogues: formData.dialogues.filter(d => d.trim()).length > 0 
          ? formData.dialogues.filter(d => d.trim()) 
          : undefined,
        mood: formData.mood.trim() || undefined,
        story: formData.story.trim() || undefined,
        createdAt: state.firstEncounter?.createdAt || new Date()
      }

      await actions.saveFirstEncounter(encounter)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLock = async () => {
    await handleSave()
    await actions.lockFirstEncounter()
    setShowLockDialog(false)
  }

  const hasContent = () => {
    return formData.time.trim() || 
           formData.location.trim() || 
           formData.weather.trim() || 
           formData.dialogues.some(d => d.trim()) || 
           formData.mood.trim() || 
           formData.story.trim()
  }

  return (
    <div className="first-encounter-editor">
      <div className="editor-header">
        <p className="editor-description">
          记录下你们初次相遇的美好时刻。一旦锁定，这段记忆将永远定格，只能回望。
        </p>
      </div>

      <form className="encounter-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="encounter-time">时间</label>
            <input
              id="encounter-time"
              type="text"
              value={formData.time}
              onChange={handleChange('time')}
              placeholder="那是什么时候？"
            />
          </div>

          <div className="form-group">
            <label htmlFor="encounter-location">地点</label>
            <input
              id="encounter-location"
              type="text"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder="在哪里相遇？"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="encounter-weather">天气</label>
          <input
            id="encounter-weather"
            type="text"
            value={formData.weather}
            onChange={handleChange('weather')}
            placeholder="那天的天气如何？"
          />
        </div>

        <div className="form-group">
          <label>对话</label>
          <div className="dialogues-container">
            {formData.dialogues.map((dialogue, index) => (
              <div key={index} className="dialogue-item">
                <input
                  type="text"
                  value={dialogue}
                  onChange={(e) => handleDialogueChange(index, e.target.value)}
                  placeholder={`对话 ${index + 1}`}
                />
                {formData.dialogues.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDialogue(index)}
                    className="btn-remove-dialogue"
                    aria-label={`删除对话 ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDialogue}
              className="btn btn-outline btn-sm"
            >
              + 添加对话
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="encounter-mood">心情</label>
          <input
            id="encounter-mood"
            type="text"
            value={formData.mood}
            onChange={handleChange('mood')}
            placeholder="当时的心情是怎样的？"
          />
        </div>

        <div className="form-group">
          <label htmlFor="encounter-story">完整的故事</label>
          <textarea
            id="encounter-story"
            value={formData.story}
            onChange={handleChange('story')}
            placeholder="完整地记录下这个初遇的故事..."
            rows={8}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasContent()}
            className="btn btn-secondary"
          >
            {isSaving ? '保存中...' : '保存草稿'}
          </button>
          <button
            type="button"
            onClick={() => setShowLockDialog(true)}
            disabled={!hasContent()}
            className="btn btn-primary"
          >
            锁定回忆
          </button>
        </div>
      </form>

      {showLockDialog && (
        <div className="lock-dialog-overlay">
          <div className="lock-dialog">
            <h3>确认锁定</h3>
            <p>锁定后，这段初遇回忆将无法再次编辑，只能回望。</p>
            <p>你确定要锁定这段珍贵的回忆吗？</p>
            <div className="dialog-actions">
              <button
                onClick={() => setShowLockDialog(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleLock}
                className="btn btn-primary"
              >
                确认锁定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}