import { Suspense } from 'react'
import { DiscoverContent } from './components/DiscoverContent'
import { Filters } from './components/Filters'

interface Props {
  searchParams: {
    category?: string
    year?: string
    price?: string
  }
}

export default function DiscoverPage({ searchParams }: Props) {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="flex items-center justify-center min-h-[80px]"><div className="text-center text-gray-500">Loading filters...</div></div>}>
        <Filters />
      </Suspense>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500">Loading artworks...</div>
        </div>
      }>
        <DiscoverContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
} 