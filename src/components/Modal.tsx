import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnEscape?: boolean
  closeOnOverlay?: boolean
  className?: string
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlay = true,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const focusableElements = useRef<HTMLElement[]>([])

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      
      const modal = modalRef.current
      if (modal) {
        const focusableSelectors = [
          'button:not([disabled])',
          'input:not([disabled])',
          'textarea:not([disabled])',
          'select:not([disabled])',
          'a[href]',
          '[tabindex]:not([tabindex="-1"])'
        ].join(', ')
        
        focusableElements.current = Array.from(
          modal.querySelectorAll(focusableSelectors)
        ) as HTMLElement[]
        
        const firstFocusable = focusableElements.current[0]
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }
      
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
      return
    }

    if (e.key === 'Tab') {
      const focusable = focusableElements.current
      if (focusable.length === 0) return

      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`modal modal-${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="关闭对话框"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}