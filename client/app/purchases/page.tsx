'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Purchase {
  id: string;
  artwork: {
    id: string;
    title: string;
    images: string[];
  };
  artist: {
    id: string;
    name: string;
  };
  amount: number;
  status: string;
  drop_off_location: string | null;
  created_at: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [dropOffLocation, setDropOffLocation] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to view your purchases');
        return;
      }

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          amount,
          status,
          drop_off_location,
          created_at,
          artwork:artwork_id (
            id,
            title,
            images
          ),
          artist:artist_id (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: Purchase[] = (data || []).map((item: any) => ({
        id: item.id,
        amount: item.amount,
        status: item.status,
        drop_off_location: item.drop_off_location,
        created_at: item.created_at,
        artwork: {
          id: item.artwork.id,
          title: item.artwork.title,
          images: item.artwork.images,
        },
        artist: {
          id: item.artist.id,
          name: item.artist.name,
        },
      }));

      setPurchases(transformedData);
    } catch (error: any) {
      toast.error('Failed to fetch purchases');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDropOffLocation = async (purchaseId: string) => {
    try {
      setUpdating(purchaseId);
      const supabase = createClient();

      const { error } = await supabase
        .from('purchases')
        .update({ drop_off_location: dropOffLocation[purchaseId] })
        .eq('id', purchaseId);

      if (error) throw error;

      toast.success('Drop-off location updated');
      fetchPurchases();
    } catch (error: any) {
      toast.error('Failed to update drop-off location');
      console.error('Error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRefund = async (purchaseId: string) => {
    try {
      setUpdating(purchaseId);
      
      const response = await fetch('/api/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purchaseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      toast.success('Refund request submitted');
      fetchPurchases();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund');
      console.error('Error:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Purchases</h1>
      
      {purchases.length === 0 ? (
        <p className="text-muted-foreground">No purchases found</p>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-32">
                  <Image
                    src={purchase.artwork.images[0]}
                    alt={purchase.artwork.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">{purchase.artwork.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Artist: {purchase.artist.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Amount: {formatPrice(purchase.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {purchase.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Purchased: {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {purchase.status === 'completed' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter drop-off location"
                          value={dropOffLocation[purchase.id] || purchase.drop_off_location || ''}
                          onChange={(e) => setDropOffLocation({
                            ...dropOffLocation,
                            [purchase.id]: e.target.value
                          })}
                        />
                        <Button
                          onClick={() => handleUpdateDropOffLocation(purchase.id)}
                          disabled={updating === purchase.id}
                        >
                          {updating === purchase.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Update'
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleRefund(purchase.id)}
                        disabled={updating === purchase.id}
                      >
                        {updating === purchase.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Request Refund'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 