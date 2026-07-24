import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...', onSearch, className = '' }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        navigate(`/blog?search=${encodeURIComponent(query.trim())}`)
      }
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div
        className={`flex items-center rounded-xl border bg-white transition-all duration-200 ${
          focused
            ? 'border-primary ring-2 ring-primary/20 shadow-lg'
            : 'border-border hover:border-muted-light'
        }`}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-light"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-border text-muted hover:bg-muted hover:text-white"
            >
              <X className="h-3 w-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
