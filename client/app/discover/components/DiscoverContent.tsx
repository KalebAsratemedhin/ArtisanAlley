import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import { getArtworks, getSuggestedArtists } from '../actions'

interface Props {
  searchParams?: {
    category?: string
    year?: string
    price?: string
  }
}

interface Artwork {
  id: string
  title: string
  price: number
  created_at: string
  images: string[]
  likeCount: number
  dislikeCount: number
  artist: {
    name: string
    avatar: string
  }
}

interface Artist {
  id: string
  name: string
  avatar: string
  followers: number
}

interface ArtworksByCategory {
  [key: string]: Artwork[]
}

export async function DiscoverContent({ searchParams = {} }: Props) {
  const { artworks, error: artworksError } = await getArtworks({
    category: searchParams.category,
    year: searchParams.year,
    priceRange: searchParams.price,
  })

  const { artists, error: artistsError } = await getSuggestedArtists()

  if (artworksError) {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading artworks: {artworksError}
      </div>
    )
  }

  const typedArtworks = artworks as ArtworksByCategory

  return (
    <div className="md:flex">
      {/* Artworks */}
      <section className="bg-white w-full md:max-w-[calc(100%-20rem)] text-black py-10 px-6 md:px-16 space-y-12">
        {Object.entries(typedArtworks || {}).map(([category, artList]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize">{category}</h2>
            <Carousel>
              <CarouselContent>
                {artList.map(art => (
                  <CarouselItem
                    key={art.id}
                    className="sm:basis-1/2 md:basis-full lg:basis-1/2 xl:basis-1/3"
                  >
                    <Link href={`/art-details/${art.id}`}>
                      <Card className="rounded-xl pt-0 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative">
                          <Image
                            src={art.images[0]}
                            alt={art.title}
                            width={400}
                            height={300}
                            className="w-full h-60 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <p className="text-white font-bold text-xl">
                              ${art.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <h3 className="text-lg font-semibold line-clamp-1">{art.title}</h3>
                          <div className="flex items-center gap-2">
                            <Image
                              src={art.artist.avatar}
                              alt={art.artist.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <p className="text-sm text-muted-foreground">{art.artist.name}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <p>{new Date(art.created_at).toLocaleDateString()}</p>
                            <div className="flex items-center gap-3">
                              <span>👍 {art.likeCount}</span>
                              <span>👎 {art.dislikeCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-6" />
              <CarouselNext className="mr-6" />
            </Carousel>
          </div>
        ))}
      </section>

      {/* Artists */}
      <section className="bg-white w-full md:w-80 shrink-0 text-black py-10 px-6 md:px-8 border-l">
        <h3 className="text-xl font-bold mb-4">Artists You May Like</h3>
        {artistsError ? (
          <p className="text-red-500">Error loading artists: {artistsError}</p>
        ) : (
          <ul className="space-y-4">
            {(artists || []).map((artist: Artist) => (
              <li key={artist.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Image
                  src={artist.avatar}
                  alt={`${artist.name}'s Avatar`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{artist.name}</p>
                  <p className="text-sm text-muted-foreground">{artist.followers} followers</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
} 