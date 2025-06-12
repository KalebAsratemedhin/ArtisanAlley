'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Reply } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  className?: string
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>()
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!mainApi || !thumbApi) return

    mainApi.on('select', () => {
      setSelectedIndex(mainApi.selectedScrollSnap())
      thumbApi.scrollTo(mainApi.selectedScrollSnap())
    })
  }, [mainApi, thumbApi])

  const onThumbClick = React.useCallback(
    (index: number) => {
      if (!mainApi) return
      mainApi.scrollTo(index)
    },
    [mainApi]
  )

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Main Carousel */}
      <Carousel
        className="relative w-full"
        setApi={setMainApi}
        opts={{
          align: 'center', // This centers the slides
          containScroll: 'keepSnaps', // This helps with centering behavior
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="flex justify-center items-center min-h-[300px]">
              <div className="p-1">
                <Card className="py-0 bg-transparent border-none shadow-none">
                  <CardContent className="flex justify-center items-center p-0">
                    <div className="relative flex justify-center">
                      <Image
                        src={image}
                        alt={`Artwork image ${index + 1}`}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="rounded-md max-w-full max-h-[70vh] w-auto h-auto"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: '70vh',
                        }}
                        priority={index === 0}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-8" />
        <CarouselNext className="mr-8" />
      </Carousel>

      {/* Thumbnail Carousel */}
      {images.length > 1 && (
        <Carousel
          className="relative"
          setApi={setThumbApi}
        >
          <CarouselContent className="flex gap-2 ml-0">
            {images.map((image, index) => (
              <CarouselItem
                key={index}
                className="pl-0 basis-auto cursor-pointer"
                onClick={() => onThumbClick(index)}
              >
                <div className={cn(
                  'transition-opacity duration-200',
                  index === selectedIndex ? 'opacity-100' : 'opacity-50'
                )}>
                  <Card className="py-0 w-20 h-20">
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <div className="relative w-full h-full ">
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  )
}