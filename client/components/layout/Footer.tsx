import Link from 'next/link'
import { Twitter, Instagram, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-black text-white border-t border-white px-6 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
        {/* App Title */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold">ArtisanAlley</h2>
          <p className="text-muted-foreground">Where creativity meets collectors.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase mb-2 text-muted-foreground">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link href="/discover" className="hover:underline">Discover</Link></li>
            <li><Link href="/purchases" className="hover:underline">Purchases</Link></li>
            <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
            <li><Link href="/login" className="hover:underline">Sign In</Link></li>
            <li><Link href="/signup" className="hover:underline">Sign Up</Link></li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase mb-2 text-muted-foreground">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-muted-foreground">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-muted-foreground">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-muted-foreground">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="text-center mt-8 text-xs text-muted-foreground border-t border-white pt-4">
        &copy; {new Date().getFullYear()} ArtisanHub. All rights reserved.
      </div>
    </footer>
  )
} 