import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/store'

interface SealDialogProps {
  memoryId: string
  isOpen: boolean
  onClose: () => void
  onSealed: () => void
}

export default function SealDialog({ memoryId, isOpen, onClose, onSealed }: SealDialogProps) {
  const { actions } = useApp()
  const [sealDate, setSealDate] = useState('')
  const [sealTime, setSealTime] = useState('12:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      firstInputRef.current?.focus()
      
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      setSealDate(tomorrow.toISOString().split('T')[0])
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleClose = () => {
    setSealDate('')
    setSealTime('12:00')
    setError('')
    setIsSubmitting(false)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sealDate) {
      setError('请选择解封日期')
      return
    }

    const selectedDateTime = new Date(`${sealDate}T${sealTime}`)
    const now = new Date()

    if (selectedDateTime <= now) {
      setError('解封时间必须在当前时间之后')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await actions.sealMemory(memoryId, selectedDateTime)
      onSealed()
      handleClose()
    } catch (error) {
      setError('封存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="seal-dialog"
      onKeyDown={handleKeyDown}
      onClose={handleClose}
      aria-labelledby="seal-dialog-title"
      aria-describedby="seal-dialog-description"
    >
      <div className="dialog-content">
        <header className="dialog-header">
          <h2 id="seal-dialog-title">封存回忆</h2>
          <button
            type="button"
            className="dialog-close"
            onClick={handleClose}
            aria-label="关闭对话框"
          >
            ×
          </button>
        </header>

        <div className="dialog-body">
          <p id="seal-dialog-description" className="dialog-description">
            封存后的回忆将被隐藏，直到指定的时间才能重新查看。这个过程不可撤销。
          </p>

          <form onSubmit={handleSubmit} className="seal-form">
            <div className="form-group">
              <label htmlFor="seal-date">解封日期</label>
              <input
                ref={firstInputRef}
                id="seal-date"
                type="date"
                value={sealDate}
                onChange={(e) => setSealDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                aria-describedby={error ? 'seal-error' : undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="seal-time">解封时间</label>
              <input
                id="seal-time"
                type="time"
                value={sealTime}
                onChange={(e) => setSealTime(e.target.value)}
                required
              />
            </div>

            {error && (
              <div id="seal-error" className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="dialog-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !sealDate}
              >
                {isSubmitting ? '封存中...' : '确认封存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  )
}