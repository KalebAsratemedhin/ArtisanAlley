'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import Link from 'next/link'
import { searchContent } from '@/app/actions/search'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<{
    users: any[]
    artpieces: any[]
  }>({ users: [], artpieces: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function performSearch() {
      if (query.length < 2) {
        setResults({ users: [], artpieces: [] })
        setLoading(false)
        return
      }

      try {
        const searchResults = await searchContent(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query])

  if (query.length < 2) {
    return (
      <div className="container max-w-4xl py-8 mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <p className="text-gray-500">Please enter at least 2 characters to search</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="users">
              Users ({results.users.length})
            </TabsTrigger>
            <TabsTrigger value="artpieces">
              Artpieces ({results.artpieces.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="grid gap-4">
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg border"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={user.avatar_url || `https://i.pravatar.cc/48`}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </Link>
              ))}
              {results.users.length === 0 && (
                <p className="text-gray-500">No users found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artpieces">
            <div className="grid gap-4">
              {results.artpieces.map((art) => (
                <Link
                  key={art.id}
                  href={`/art-details/${art.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg border"
                >
                  <div className="h-16 w-16 rounded overflow-hidden mr-4">
                    <Image
                      src={art.images[0] || '/placeholder-art.png'}
                      alt={art.title}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{art.title}</span>
                    <span className="text-sm text-gray-500">by {art.profiles.name}</span>
                  </div>
                </Link>
              ))}
              {results.artpieces.length === 0 && (
                <p className="text-gray-500">No artpieces found</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 