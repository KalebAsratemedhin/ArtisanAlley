'use client'
import { Suspense } from 'react'
import ArtDetails from './ArtDetails'

interface PageProps {
  params: { id: string }
}

export default function ArtDetailsPage({ params }: PageProps) {
  const id = params.id;
  // console.log("this id though", id)

  return (    
      <ArtDetails id={id} />
  )
}
