'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function createArtPiece(formData: FormData) {
  const supabase = await createClient()

  console.log("formadata , ", formData);

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in.' }
  }

  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const images = formData.getAll('images') as File[]

    if (!title || !category || images.length === 0) {
      return { error: 'Please fill all required fields.' }
    }

    // Upload images to Supabase Storage
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('artworks')
          .upload(fileName, file)

  console.log("data , ", data, uploadError);


        if (uploadError) {
          throw new Error('Failed to upload image')
        }

        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(fileName)
console.log("public url ", publicUrl);
        return publicUrl
      })
    )
    console.log("imageUrls , ", imageUrls);

    // Create artwork record in database
    const { error: insertError } = await supabase
      .from('ArtPiece')
      .insert([
        {
          title,
          description,
          price,
          category,
          images: imageUrls,
          user_id: user.id,
        },
      ])

    if (insertError) {
      throw insertError
    }

    revalidatePath('/discover')
    revalidatePath('/profile')
    return { success: 'Artwork created successfully!' }
  } catch (err: any) {
    return { error: err.message || 'Failed to create artwork' }
  }
} 