import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  min: number
  max: number
  step: number
  minDistance: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatLabel?: (value: number) => string
  className?: string
  thumbClassName?: string
  trackClassName?: string
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

const snap = (n: number, step: number, min: number) =>
  Math.round((n - min) / step) * step + min

export const RangeSlider = ({
  min,
  max,
  step,
  minDistance,
  value,
  onChange,
  formatLabel = (v) => `${v}`,
  className = 'horizontal-slider',
  thumbClassName = 'thumb',
  trackClassName = 'track',
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<0 | 1 | null>(null)

  const positionFromEvent = useCallback(
    (clientX: number): number => {
      const el = containerRef.current
      if (!el) return min
      const rect = el.getBoundingClientRect()
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      const raw = min + ratio * (max - min)
      return clamp(snap(raw, step, min), min, max)
    },
    [min, max, step]
  )

  const updateValue = useCallback(
    (index: 0 | 1, next: number) => {
      const [lo, hi] = value
      let newLo = lo
      let newHi = hi
      if (index === 0) {
        newLo = clamp(next, min, hi - minDistance)
      } else {
        newHi = clamp(next, lo + minDistance, max)
      }
      if (newLo !== lo || newHi !== hi) {
        onChange([newLo, newHi])
      }
    },
    [value, min, max, minDistance, onChange]
  )

  useEffect(() => {
    if (dragging === null) return

    const handleMove = (e: PointerEvent) => {
      updateValue(dragging, positionFromEvent(e.clientX))
    }
    const handleUp = () => setDragging(null)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [dragging, positionFromEvent, updateValue])

  const handleKeyDown = (index: 0 | 1) => (e: React.KeyboardEvent) => {
    let delta = 0
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step
    else if (e.key === 'PageDown') delta = -step * 10
    else if (e.key === 'PageUp') delta = step * 10
    else if (e.key === 'Home') {
      e.preventDefault()
      updateValue(index, min)
      return
    } else if (e.key === 'End') {
      e.preventDefault()
      updateValue(index, max)
      return
    } else {
      return
    }
    e.preventDefault()
    updateValue(index, value[index] + delta)
  }

  const range = max - min
  const pct = (v: number) => ((v - min) / range) * 100

  return (
    <div ref={containerRef} className={className}>
      <div className={trackClassName} />
      {([0, 1] as const).map((i) => (
        <div
          key={i}
          className={thumbClassName}
          role="slider"
          tabIndex={0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[i]}
          style={{ left: `${pct(value[i])}%` }}
          onPointerDown={(e) => {
            ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
            setDragging(i)
          }}
          onKeyDown={handleKeyDown(i)}
        >
          {formatLabel(value[i])}
        </div>
      ))}
    </div>
  )
}
