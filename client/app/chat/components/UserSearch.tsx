'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsSearching(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${query}%`)
        .limit(5)

      setIsSearching(false)
      if (error) {
        console.error('Error searching users:', error)
        return
      }

      setResults(data || [])
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleUserClick = (userId: string) => {
    router.push(`/chat?userId=${userId}`)
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search users to chat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Search Results */}
      {query.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name || 'Anonymous'}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  )
} 