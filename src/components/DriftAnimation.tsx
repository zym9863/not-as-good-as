import { useEffect, useState, useRef } from 'react'

interface DriftAnimationProps {
  onAnimationComplete: () => void
}

export default function DriftAnimation({ onAnimationComplete }: DriftAnimationProps) {
  const [phase, setPhase] = useState<'preparing' | 'drifting' | 'fading'>('preparing')
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    if (prefersReducedMotion) {
      timeouts.push(setTimeout(() => {
        onAnimationComplete()
      }, 500))
    } else {
      timeouts.push(setTimeout(() => {
        setPhase('drifting')
      }, 500))

      timeouts.push(setTimeout(() => {
        setPhase('fading')
      }, 3000))

      timeouts.push(setTimeout(() => {
        onAnimationComplete()
      }, 4000))
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [onAnimationComplete, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div className="drift-animation reduced-motion">
        <div className="drift-content">
          <div className="memory-card simple-fade">
            <div className="memory-representation">📝</div>
            <p>回忆正在离开...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`drift-animation phase-${phase}`}>
      <div className="drift-background">
        <div className="water-surface"></div>
        <div className="waves wave-1"></div>
        <div className="waves wave-2"></div>
        <div className="waves wave-3"></div>
      </div>

      <div className="drift-content">
        <div className="memory-card floating">
          <div className="memory-representation">
            <div className="paper-boat">
              <div className="boat-body"></div>
              <div className="boat-sail"></div>
            </div>
          </div>
          
          <div className="memory-text">
            <p>载着回忆的小船</p>
            <p>正慢慢漂向远方...</p>
          </div>
        </div>

        {phase === 'drifting' && (
          <div className="drift-particles">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={`particle particle-${i}`}>
                {['✨', '🌟', '💫', '⭐'][i % 4]}
              </div>
            ))}
          </div>
        )}

        {phase === 'fading' && (
          <div className="farewell-message">
            <p>再见了，美好的回忆</p>
            <p>愿你在时光的海洋中安好</p>
          </div>
        )}
      </div>
    </div>
  )
}