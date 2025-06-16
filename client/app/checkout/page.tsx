'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabaseClient'

export default function CheckoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { items, getTotal } = useCartStore()
  const total = getTotal()

  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items, router])

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            artistId: item.artistId
          }))
        }),
      })

      if (!response.ok) {
        console.log("Response", response)
        throw new Error('Network response was not ok')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe checkout
      const stripe = await getStripe()
      if (!stripe) throw new Error('Failed to load Stripe')
      
      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) throw error

    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.price)}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Total */}
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Order Total</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 