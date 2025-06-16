import ArtDetails from './ArtDetails'

interface PageProps {
  params: { id: string }
}

export default function ArtDetailsPage({ params }: PageProps) {
  const { id } = params;

  return (    
      <ArtDetails id={id} />
  )
}
