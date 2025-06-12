'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast, Toaster } from 'sonner'
import { createArtPiece } from './actions'

export default function CreateArtworkPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setImageFiles(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))])
  }

  const handleDeleteImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !category || imageFiles.length === 0) {
      toast.error('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      imageFiles.forEach(file => {
        formData.append('images', file)
      })

      const result = await createArtPiece(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        router.push('/discover')
      }
    } catch (error) {
      console.error(error, 'this create error')
      toast.error('Failed to create artwork')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Add New Artwork</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={4}
        />

        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (USD)"
          type="number"
          min="0"
          step="0.01"
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="sculpture">Sculpture</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
          </SelectContent>
        </Select>

        {/* Image Upload Box */}
        <div className="w-full border border-dashed border-gray-400 rounded-md p-6 text-center space-y-2">
          <div className="flex flex-col items-center">
            <label 
              htmlFor="imageUploader" 
              className="cursor-pointer"
            >
              <div className="space-y-2">
                <p className="text-sm border p-2 rounded-md border-gray-300 font-medium text-gray-700">Upload Images</p>
              </div>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              id="imageUploader"
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative h-24">
                  <Image
                    src={src}
                    alt={`Preview ${i + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        <Toaster />

        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
} 