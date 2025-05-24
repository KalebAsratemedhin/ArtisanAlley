import { supabase } from '@/lib/supabase'

export async function createArtPiece(
    userId: string,
  artworkData: {
    title: string
    description: string
    price: number
    category: string
    images: File[]
  }
) {

    const uploadedImageUrls = await uploadImages(artworkData.images, userId);
  

  const { error: insertError } = await supabase.from('ArtPiece').insert([
    {
      title: artworkData.title,
      description: artworkData.description,
      price: artworkData.price,
      category: artworkData.category,
      images: uploadedImageUrls,
      user_id: userId,
    }
  ])

  if (insertError) {
    console.error('Insert error:', insertError)
    throw new Error('Failed to create artwork')
  }

  return true
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')         // replace spaces with underscores
    .replace(/[^\w.-]/g, '')      // remove non-url-safe characters
}


export async function uploadImages(images: File[], userId: string){
  const uploadedImageUrls: string[] = []

  for (const file of images) {
    const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`
    const filePath = `artworks/${userId}/${fileName}`
    const { data, error } = await supabase.storage
      .from('pictures')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload image: ${file.name}`)
    }

    const publicUrl = supabase.storage.from('pictures').getPublicUrl(filePath)
    uploadedImageUrls.push(publicUrl.data.publicUrl)
  }
  return uploadedImageUrls;
}

export  async function reactToArtPiece(
  userId: string,
  art_piece_id: number,
  type: string
) {

const { error: insertError } = await supabase.from('Reaction').upsert([
  {
    type,
    art_piece_id,
    user_id: userId,
  }
],
{
  onConflict: 'user_id, art_piece_id',
})

if (insertError) {
  console.error('Insert error:', insertError)
  throw new Error('Failed to create reaction')
} 

return true
}
