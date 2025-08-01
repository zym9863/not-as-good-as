import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../state/store'
import DriftAnimation from './DriftAnimation'

interface LetGoDialogProps {
  memoryId: string
  memoryTitle: string
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

export default function LetGoDialog({ 
  memoryId, 
  memoryTitle, 
  isOpen, 
  onClose, 
  onDeleted 
}: LetGoDialogProps) {
  const { actions } = useApp()
  const [step, setStep] = useState<'confirm' | 'animation' | 'deleting'>('confirm')
  const [acknowledged, setAcknowledged] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      checkboxRef.current?.focus()
      setStep('confirm')
      setAcknowledged(false)
      setIsDeleting(false)
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleClose = () => {
    if (step === 'animation' || isDeleting) return
    
    setStep('confirm')
    setAcknowledged(false)
    setIsDeleting(false)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && step === 'confirm' && !isDeleting) {
      handleClose()
    }
  }

  const handleConfirm = () => {
    if (!acknowledged) return
    setStep('animation')
  }

  const handleAnimationComplete = async () => {
    setStep('deleting')
    setIsDeleting(true)
    
    try {
      await actions.deleteMemory(memoryId)
      onDeleted()
      handleClose()
    } catch (error) {
      console.error('删除回忆失败:', error)
      setStep('confirm')
      setIsDeleting(false)
    }
  }

  const renderConfirmStep = () => (
    <div className="dialog-content">
      <header className="dialog-header">
        <h2 id="letgo-dialog-title">让回忆漂流</h2>
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
        <div className="letgo-warning">
          <div className="warning-icon">⚠️</div>
          <p className="warning-text">
            你即将让「<strong>{memoryTitle}</strong>」漂流而去。
          </p>
          <p className="warning-description">
            这个过程不可撤销，回忆将永远消失，无法找回。
          </p>
        </div>

        <div className="acknowledgment">
          <label className="checkbox-label">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              aria-describedby="acknowledge-description"
            />
            <span id="acknowledge-description">
              我理解这个操作不可恢复，回忆将永远消失
            </span>
          </label>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!acknowledged}
            className="btn btn-danger"
          >
            确认漂流
          </button>
        </div>
      </div>
    </div>
  )

  const renderAnimationStep = () => (
    <div className="dialog-content animation-content">
      <DriftAnimation onAnimationComplete={handleAnimationComplete} />
    </div>
  )

  const renderDeletingStep = () => (
    <div className="dialog-content deleting-content">
      <div className="deleting-state">
        <div className="deleting-spinner"></div>
        <p>正在送别回忆...</p>
      </div>
    </div>
  )

  return (
    <dialog
      ref={dialogRef}
      className={`letgo-dialog step-${step}`}
      onKeyDown={handleKeyDown}
      onClose={handleClose}
      aria-labelledby="letgo-dialog-title"
    >
      {step === 'confirm' && renderConfirmStep()}
      {step === 'animation' && renderAnimationStep()}
      {step === 'deleting' && renderDeletingStep()}
    </dialog>
  )
}