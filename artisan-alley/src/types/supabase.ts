// types/supabase.ts

export type ArtPiece = {
    id: number
    created_at: string
    title: string 
    description: string
    price: number
    category: string
    user_id: string
    images: string[]
  }
  
  export type Reaction = {
    id: number
    created_at: string
    art_piece_id: number
    user_id: string
    type: string
  }
  
  export type Comment = {
    id: number
    created_at: string
    art_piece_id: number
    user_id: string
    comment: string
  }
  
  export type Profile = {
    id: number
    created_at: string
    user_id: string | null
    avatar_url: string | null
    name: string | null
  }
  