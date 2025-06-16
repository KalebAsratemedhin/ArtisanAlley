'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserArtworks } from './actions'
import { ArtworkCard } from '@/components/ArtworkCard'

interface Artwork {
  id: string
  title: string
  image: string
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArtworks() {
      const result = await getUserArtworks()
      
      if (result.error) {
        setError(result.error)
      } else if (result.artworks) {
        setArtworks(result.artworks)
      }
      
      setLoading(false)
    }

    fetchArtworks()
  }, [])

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Gallery</h1>
        <Link href="/create">
          <Button variant="default" className="bg-black hover:bg-gray-900">
            + Add New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading artworks...</div>
      ) : artworks.length === 0 ? (
        <div className="text-center text-gray-500">No artworks found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artworks.map(art => (
            <ArtworkCard
              key={art.id}
              id={art.id}
              title={art.title}
              image={art.image}
              artistName="Unknown Artist"
              artistAvatar={null}
            />
          ))}
        </div>
      )}
    </div>
  )
} 