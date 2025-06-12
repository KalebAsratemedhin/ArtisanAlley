'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Filter options
const categories = ["painting", "digital", "sculpture", "photography"]
const years = ["2025", "2024", "2023"]
const priceRanges = ["<50", "50-100", "100-200", "200+"]

export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get('category') || undefined
  const selectedYear = searchParams.get('year') || undefined
  const selectedPrice = searchParams.get('price') || undefined

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <section className="bg-white py-6 px-6 md:px-16 border-b">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedCategory} onValueChange={value => updateFilter('category', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={value => updateFilter('year', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPrice} onValueChange={value => updateFilter('price', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map(price => (
              <SelectItem key={price} value={price}>
                {price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  )
} 