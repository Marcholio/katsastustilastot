import { useEffect, useMemo, useRef, useState } from 'react'

export type SearchSelectOption = {
  name: string
  value: string
}

type Props = {
  options: SearchSelectOption[]
  value?: string
  placeholder?: string
  search?: boolean
  onChange: (value: string) => void
  className?: string
}

export const SearchSelect = ({
  options,
  value,
  placeholder,
  search = false,
  onChange,
  className,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  )

  const filtered = useMemo(() => {
    if (!search || !query) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.name.toLowerCase().includes(q))
  }, [options, query, search])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlight(
        Math.max(
          0,
          options.findIndex((o) => o.value === value)
        )
      )
      // focus input after open
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const node = listRef.current?.children[highlight] as
      | HTMLElement
      | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const choose = (opt: SearchSelectOption) => {
    onChange(opt.value)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setHighlight((h) => Math.min(filtered.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      const opt = filtered[highlight]
      if (opt) choose(opt)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`search-select${className ? ` ${className}` : ''}${
        open ? ' is-open' : ''
      }`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className="search-select__control"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`search-select__value${
            selected ? '' : ' search-select__value--placeholder'
          }`}
        >
          {selected?.name ?? placeholder ?? ''}
        </span>
        <span className="search-select__arrow" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="search-select__panel">
          {search && (
            <input
              ref={inputRef}
              className="search-select__search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hae..."
            />
          )}
          <ul
            ref={listRef}
            className="search-select__list"
            role="listbox"
            tabIndex={-1}
          >
            {filtered.length === 0 && (
              <li className="search-select__empty">Ei tuloksia</li>
            )}
            {filtered.map((opt, i) => {
              const isSelected = opt.value === value
              const isHighlighted = i === highlight
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'search-select__option',
                    isSelected ? 'is-selected' : '',
                    isHighlighted ? 'is-highlighted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(opt)
                  }}
                  onMouseEnter={() => setHighlight(i)}
                >
                  {opt.name}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
