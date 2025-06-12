'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/store/cart';

export default function SuccessPage() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container max-w-2xl py-24">
      <Card className="p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Thank you for your purchase!</h1>
            <p className="text-muted-foreground">
              Your payment has been processed successfully.
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
} 