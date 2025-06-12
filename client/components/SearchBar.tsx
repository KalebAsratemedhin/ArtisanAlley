'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Update local state when URL search param changes
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  return (
    <form onSubmit={handleSearch} className="w-full max-w-sm">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search users or artpieces..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4"
        />
        <button
          type="submit"
          className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
} 