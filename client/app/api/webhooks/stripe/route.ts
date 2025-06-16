import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
});

// Create a Supabase client with service role key for webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('Webhook event type:', event.type);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('Processing checkout.session.completed event');
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (!session.metadata?.userId || !session.metadata?.artworkId || !session.metadata?.artistId) {
            return NextResponse.json(
              { error: 'Missing required metadata in session' },
              { status: 400 }
            );
          }

          // Create purchase record using service role client
          const { error } = await supabase
            .from('purchases')
            .insert({
              user_id: session.metadata.userId,
              artwork_id: session.metadata.artworkId,
              artist_id: session.metadata.artistId,
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              status: 'completed'
            });

          if (error) {
            console.error('Error creating purchase:', error);
            return NextResponse.json(
              { error: 'Failed to create purchase record' },
              { status: 500 }
            );
          }
          console.log('Purchase record created successfully');
          break;
        }

        case 'charge.refunded': {
          console.log('Processing charge.refunded event');
          const charge = event.data.object as Stripe.Charge;
          
          if (!charge.payment_intent) {
            return NextResponse.json(
              { error: 'Missing payment_intent in charge' },
              { status: 400 }
            );
          }

          // Update purchase status using service role client
          const { error } = await supabase
            .from('purchases')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', charge.payment_intent);

          if (error) {
            console.error('Error updating purchase:', error);
            return NextResponse.json(
              { error: 'Failed to update purchase status' },
              { status: 500 }
            );
          }
          console.log('Purchase status updated to refunded');
          break;
        }

        default: {
          console.log(`Unhandled event type: ${event.type}`);
          return NextResponse.json(
            { received: true, message: `Unhandled event type: ${event.type}` },
            { status: 200 }
          );
        }
      }

      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error('Webhook signature verification error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
} 