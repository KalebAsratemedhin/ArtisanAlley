'use client'

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
import { useMemo } from 'react'

export default function HomePage() {
  const features = useMemo(
    () => [
      {
        icon: '🛒',
        title: 'Purchase',
        desc: 'Buy unique handmade pieces from artists worldwide.',
      },
      {
        icon: '💬',
        title: 'Discussion',
        desc: 'Join forums and connect with fellow creators.',
      },
      {
        icon: '🖼️',
        title: 'Gallery',
        desc: 'Showcase your work in beautiful portfolios.',
      },
      {
        icon: '📺',
        title: 'Live Chat',
        desc: 'Connect with buyers and fans in real time.',
      },
    ],
    []
  )

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
                “
              </div>
              <br />
              Art enables us to find ourselves and lose ourselves at the same
              time.
              <div className="text-[orangered] text-6xl font-bold absolute -right-6 bottom-0">
                ”
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
        <Carousel>
          <CarouselContent>
            {[...Array(6)].map((_, i) => (
              <CarouselItem key={i} className="md:basis-1/3">
                <Card className="rounded-xl overflow-hidden">
                  <Image
                    src={`https://source.unsplash.com/random/400x300?art,${i}`}
                    alt={`Artwork ${i}`}
                    width={400}
                    height={300}
                    className="w-full h-60 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">
                      Artwork Title {i + 1}
                    </h3>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-8" />
          <CarouselNext className="mr-8" />
        </Carousel>
      </section>

      {/* Features Section */}
      <section className="bg-black text-black py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why ArtisanAlley?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="p-6 text-center bg-black rounded-xl shadow border-orange-600 text-white"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-xl">{feature.title}</h3>
              <p className="text-muted-foreground mt-2">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 text-black py-20 px-6 md:px-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          What Our Artists Say
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((n) => (
            <Card key={n}>
              <CardContent className="p-6">
                <p className="italic">
                  “ArtisanAlley helped me reach a global audience. It's the
                  perfect platform for any artist.”
                </p>
                <p className="mt-4 font-semibold">— Artist {n}</p>
              </CardContent>
            </Card>
          ))}
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
