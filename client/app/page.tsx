import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Artwork {
  id: string
  title: string
  images: string[]
  price: number
  user: {
    name: string
    avatar_url: string | null
  }
}

async function getFeaturedArtworks() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ArtPiece')
    .select(`
      id,
      title,
      images,
      price,
      user:profiles!user_id (
        name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching featured artworks:', error)
    return { error: 'Failed to fetch featured artworks' }
  }

  // Transform the data to match our Artwork interface
  const artworks: Artwork[] = data.map((item: any) => ({
    id: item.id,
    title: item.title,
    images: item.images,
    price: item.price,
    user: {
      name: item.user.name,
      avatar_url: item.user.avatar_url
    }
  }))

  return { artworks }
}

function ArtworkCarousel() {
  return (
    <Carousel>
      <CarouselContent>
        {[...Array(6)].map((_, i) => (
          <CarouselItem key={i} className="md:basis-1/3">
            <div className="space-y-4">
              <Skeleton className="w-full h-60 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-8" />
      <CarouselNext className="mr-8" />
    </Carousel>
  )
}

async function FeaturedArtworks() {
  const result = await getFeaturedArtworks()
  
  if (result.error) {
    return <div className="text-center text-red-500 col-span-3">{result.error}</div>
  }

  if (!result.artworks) {
    return <div className="text-center text-red-500 col-span-3">No artworks found</div>
  }

  return (
    <Carousel>
      <CarouselContent>
        {result.artworks.map((artwork) => (
          <CarouselItem key={artwork.id} className="md:basis-1/3">
            <Link href={`/art-details/${artwork.id}`} className="group">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl">
                  <Image
                    src={artwork.images[0]}
                    alt={artwork.title}
                    width={400}
                    height={300}
                    className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold group-hover:text-orange-600 transition-colors">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={artwork.user.avatar_url || '/default-avatar.png'}
                        alt={artwork.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {artwork.user.name}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    ${artwork.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-8" />
      <CarouselNext className="mr-8" />
    </Carousel>
  )
}

export default function HomePage() {
  const features = [
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto">
          <rect x="3" y="5" width="18" height="14" rx="3" fill="url(#galleryGradient)"/>
          <circle cx="8" cy="12" r="2.5" fill="#fff"/>
          <path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="galleryGradient" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f472b6"/>
              <stop offset="1" stopColor="#a21caf"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: 'Gallery',
      desc: 'Showcase your art in a beautiful, customizable gallery.',
      bg: 'bg-gradient-to-br from-pink-400 via-purple-400 to-fuchsia-500',
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto">
          <rect x="2" y="7" width="20" height="11" rx="3" fill="url(#marketGradient)"/>
          <path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" stroke="#fff" strokeWidth="1.5"/>
          <circle cx="8" cy="16" r="1.5" fill="#fff"/>
          <circle cx="16" cy="16" r="1.5" fill="#fff"/>
          <defs>
            <linearGradient id="marketGradient" x1="2" y1="7" x2="22" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24"/>
              <stop offset="1" stopColor="#f59e42"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: 'Marketplace',
      desc: 'Buy and sell unique art pieces from creators worldwide.',
      bg: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500',
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto">
          <rect x="3" y="5" width="18" height="12" rx="4" fill="url(#chatGradient)"/>
          <path d="M7 13h6M7 9h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="chatGradient" x1="3" y1="5" x2="21" y2="17" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8"/>
              <stop offset="1" stopColor="#0ea5e9"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: 'Chat',
      desc: 'Connect instantly with artists and buyers in real time.',
      bg: 'bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-500',
    },
    {
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto">
          <circle cx="12" cy="12" r="10" fill="url(#communityGradient)"/>
          <circle cx="8.5" cy="13" r="2" fill="#fff"/>
          <circle cx="15.5" cy="13" r="2" fill="#fff"/>
          <path d="M12 17c-2.5 0-4.5-1.5-4.5-3.5S9.5 10 12 10s4.5 1.5 4.5 3.5S14.5 17 12 17z" fill="#fff" fillOpacity=".5"/>
          <defs>
            <linearGradient id="communityGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399"/>
              <stop offset="1" stopColor="#10b981"/>
            </linearGradient>
          </defs>
        </svg>
      ),
      title: 'Community',
      desc: 'Join a vibrant, supportive network of creators.',
      bg: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500',
    },
  ]

  return (
    <div className="w-full">
      {/* Intro Section */}
      <section className="bg-black text-white h-svh items-center flex py-20 px-6 md:px-16">
        <div className="flex w-full gap-10 items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold">
              <span className="text-[orangered]">ArtisanAlley</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Where creativity meets opportunity. Showcase, discover, and
              connect through art.
            </p>
            <blockquote className="relative text-2xl md:text-3xl italic font-semibold max-w-3xl mx-auto mt-10 ml-2">
              <div className="text-[orangered] text-6xl font-bold absolute -left-6 top-0">
                "
              </div>
              <br />
              Art enables us to find ourselves and lose ourselves at the same
              time.
              <div className="text-[orangered] text-6xl font-bold absolute -right-6 bottom-0">
                "
              </div>
            </blockquote>
            <Link
              href="/signup"
              className="flex border-orange-600 border font-bold text-xl w-32 items-center justify-center rounded-md mt-8 py-2 hover:border-white hover:text-orange-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Signup
            </Link>
          </div>
          <div className="ml-auto">
            <Image
              src="/J1JmO1VC.jpeg"
              alt="Featured Art"
              width={500}
              height={500}
              className="rounded-xl shadow-lg max-h-svh object-cover"
            />
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="bg-white text-black py-16 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Featured Artworks
        </h2>
        <Suspense fallback={<ArtworkCarousel />}>
          <FeaturedArtworks />
        </Suspense>
      </section>

      {/* Features Section */}
      <section className="bg-white text-black py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why ArtisanAlley?
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`relative p-8 pt-10 rounded-2xl shadow-xl text-white ${feature.bg} hover:scale-105 hover:shadow-2xl transition-all duration-300 group overflow-hidden`}
            >
              <div className="relative z-10 flex flex-col items-center">
                {feature.icon}
                <h3 className="font-bold text-xl mt-4 mb-2 text-white drop-shadow-lg group-hover:text-white">
                  {feature.title}
                </h3>
                <p className="text-white/90 text-base group-hover:text-white">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 text-black py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          What Our Artists Say
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Testimonial 1: Ethiopian artist */}
          <Card>
            <CardContent className="p-6">
              <p className="italic">
                "ArtisanAlley gave me the platform to share my Ethiopian heritage with the world. My art has reached people I never imagined."
              </p>
              <p className="mt-4 font-semibold">— Lulit Bekele (Addis Ababa, Ethiopia)</p>
            </CardContent>
          </Card>
          {/* Testimonial 2: International artist */}
          <Card>
            <CardContent className="p-6">
              <p className="italic">
                "I found a vibrant, supportive community on ArtisanAlley. The exposure and feedback have been invaluable for my creative journey."
              </p>
              <p className="mt-4 font-semibold">— Sofia Rossi (Florence, Italy)</p>
            </CardContent>
          </Card>
          {/* Testimonial 3: Ethiopian artist */}
          <Card>
            <CardContent className="p-6">
              <p className="italic">
                "Selling my paintings internationally was a dream. ArtisanAlley made it possible and easy!"
              </p>
              <p className="mt-4 font-semibold">— Dawit Tesfaye (Bahir Dar, Ethiopia)</p>
            </CardContent>
          </Card>
          {/* Testimonial 4: International artist */}
          <Card>
            <CardContent className="p-6">
              <p className="italic">
                "The gallery tools are top-notch, and I love connecting with buyers from all over the globe. Highly recommended!"
              </p>
              <p className="mt-4 font-semibold">— Maya Patel (Mumbai, India)</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white text-black py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-10">FAQs</h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="faq1">
            <AccordionTrigger>How do I sell my artwork?</AccordionTrigger>
            <AccordionContent>
              Just sign up, create your gallery, and list your work for sale.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq2">
            <AccordionTrigger>Is there a commission fee?</AccordionTrigger>
            <AccordionContent>
              Yes, a small platform fee is applied per sale to support hosting
              and features.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq3">
            <AccordionTrigger>Can I message buyers?</AccordionTrigger>
            <AccordionContent>
              Absolutely! Live chat and messaging are available for all users.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
