'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/store/cart';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('=== CHECKOUT SUCCESS PAGE ===');
    console.log('Session ID:', sessionId);
    console.log('Time:', new Date().toISOString());
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    if (!sessionId) {
      console.error('No session ID found in URL');
      router.push('/');
      return;
    }
    
    // Verify the purchase was created
    const verifyPurchase = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Wait for the webhook to create the purchase (max 5 seconds)
        let attempts = 0;
        while (attempts < 5) {
          console.log(`Attempt ${attempts + 1} to verify purchase for session ${sessionId}`);
          const { data: purchase, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

          if (error) {
            console.error('Error querying purchase:', error);
          }

          if (purchase) {
            console.log('Purchase found:', purchase);
            // Clear the cart after successful payment
            clearCart();
            setVerifying(false);
            return;
          }

          console.log('Purchase not found, waiting...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }

        // If we get here, the purchase wasn't created
        console.error('Purchase verification failed after 5 attempts');
        toast.error('There was an issue with your purchase. Please contact support.');
        router.push('/');
      } catch (error) {
        console.error('Error verifying purchase:', error);
        toast.error('There was an issue with your purchase. Please contact support.');
        router.push('/');
      }
    };

    verifyPurchase();
  }, [clearCart, router, searchParams]);

  if (verifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">Verifying Your Purchase</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your payment...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Thank You for Your Purchase!</h1>
        <p className="text-muted-foreground">
          Your payment was successful and your order has been confirmed.
        </p>
        <div className="pt-4">
          <Button
            onClick={() => router.push('/purchases')}
            className="w-full"
          >
            View Your Orders
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-4"><Card className="max-w-md w-full p-6 text-center space-y-4"><Loader2 className="w-16 h-16 animate-spin mx-auto" /><h1 className="text-2xl font-bold">Verifying Your Purchase</h1><p className="text-muted-foreground">Please wait while we confirm your payment...</p></Card></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 