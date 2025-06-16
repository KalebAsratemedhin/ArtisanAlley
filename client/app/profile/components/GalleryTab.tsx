'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getUserArtworksById } from '../actions'
import { ArtworkCard } from '@/components/ArtworkCard'

interface Artwork {
  id: string
  title: string
  images: string[]
}

export function GalleryTab({ userId }: { userId: string }) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArtworks() {
      const result = await getUserArtworksById(userId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.artworks) {
        setArtworks(result.artworks)
      }
      
      setLoading(false)
    }

    fetchArtworks()
  }, [userId])

  if (loading) {
    return <div className="text-center py-8">Loading artworks...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No artworks found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {artworks.map(art => (
        <ArtworkCard
          key={art.id}
          id={art.id}
          title={art.title}
          image={art.images[0]}
          artistName="Unknown Artist"
          artistAvatar={null}
        />
      ))}
    </div>
  )
} 