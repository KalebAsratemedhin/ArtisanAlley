'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { SearchBar } from '@/components/SearchBar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  GalleryThumbnails,
  MessageCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CartSheet } from '@/components/cart/CartSheet'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', data.session.user.id)
          .single()
        
        setProfileData(profile)
      }
    }
    getSession()
  }, [])

  const linkClass = (path: string, isMobile = false) => {
    const isActive = pathname === path
    return [
      'flex items-center px-3 py-2 rounded-md font-medium text-sm transition-colors',
      isMobile ? 'w-full' : '',
      isActive ? 'bg-black text-white' : 'hover:bg-black hover:text-white',
    ].join(' ')
  }

  const goTo = (path: string) => {
    router.push(path)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/')
  }

  return (
    <header className="w-full bg-white text-black border-b border-muted px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          ArtisanAlley
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-xl mx-4">
          <SearchBar />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <CartSheet />
              <Link href="/purchases" className={linkClass('/purchases')}>
                <ShoppingCart className="w-4 h-4 mr-1" /> Purchases
              </Link>
              <Link href="/gallery" className={linkClass('/gallery')}>
                <GalleryThumbnails className="w-4 h-4 mr-2" /> Gallery
              </Link>
              <Link href="/chat" className={linkClass('/chat')}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Link>

              {/* Avatar + Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <img
                    src={
                      profileData?.avatar_url ||
                      session?.user?.user_metadata?.avatar_url ||
                      `https://i.pravatar.cc/40`
                    }
                    className="w-8 h-8 rounded-full cursor-pointer"
                    alt="User avatar"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => goTo('/profile')}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goTo('/settings')}>
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass('/login')}>
                <LogIn className="w-4 h-4 mr-1" /> Sign In
              </Link>
              <Link href="/signup" className={linkClass('/signup')}>
                <UserPlus className="w-4 h-4 mr-1" /> Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile: Hamburger */}
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left">
            <div className="p-4 space-y-4">
              {/* Search Bar - Mobile */}
              <div className="mb-4">
                <SearchBar />
              </div>
              
              {session ? (
                <>
                  <div className="mb-4">
                    <CartSheet />
                  </div>
                  <Link href="/purchases" className={linkClass('/purchases', true)}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Purchases
                  </Link>
                  <Link href="/profile" className={linkClass('/profile', true)}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </Link>
                  <Link href="/settings" className={linkClass('/settings', true)}>
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Link>
                  <Link href="/gallery" className={linkClass('/gallery', true)}>
                    <GalleryThumbnails className="w-4 h-4 mr-2" /> Gallery
                  </Link>
                  <Link href="/chat" className={linkClass('/chat', true)}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat
                  </Link>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-black hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={linkClass('/login', true)}>
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </Link>
                  <Link href="/signup" className={linkClass('/signup', true)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 