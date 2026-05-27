import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { supabaseAdmin } from '../../../lib/supabase'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    endpoint: 'polar-webhook',
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('POLAR_WEBHOOK_SECRET is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    let event: any
    try {
      event = validateEvent(rawBody, headers, webhookSecret)
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      throw error
    }
    
    console.log('Polar webhook received:', event.type)
    
    switch (event.type) {
      case 'checkout.created':
      case 'checkout.updated':
        await handleCheckoutEvent(event)
        break
      case 'subscription.created':
      case 'subscription.active':
        await handleSubscriptionActive(event)
        break
      case 'subscription.canceled':
      case 'subscription.revoked':
        await handleSubscriptionCanceled(event)
        break
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCheckoutEvent(event: any) {
  const checkout = event.data
  const metadata = checkout.metadata || {}
  
  if (!metadata.provider_type || !metadata.company_name) {
    console.log('Checkout has no provider metadata, skipping')
    return
  }
  
  const { error } = await supabaseAdmin
    .from('providers')
    .upsert({
      polar_checkout_id: checkout.id,
      email: checkout.customer_email || metadata.email,
      type: metadata.provider_type,
      name: metadata.company_name,
      bio: metadata.bio || '',
      country: metadata.country,
      ports: metadata.ports ? metadata.ports.split(',').map((p: string) => p.trim()) : [],
      phone: metadata.phone || null,
      whatsapp: metadata.whatsapp || null,
      website: metadata.website || null,
      address: metadata.address || null,
      contact_person: metadata.contact_person || null,
      svc: metadata.svc ? metadata.svc.split(',').map((s: string) => s.trim()) : null,
      plan: metadata.plan || null,
      status: 'pending'
    }, {
      onConflict: 'polar_checkout_id'
    })
  
  if (error) {
    console.error('Failed to upsert provider:', error)
    throw error
  }
}

async function handleSubscriptionActive(event: any) {
  const subscription = event.data
  const customerId = subscription.customer_id
  const checkoutId = subscription.checkout_id
  const metadata = subscription.metadata || {}
  
  if (checkoutId) {
    const { data, error } = await supabaseAdmin
      .from('providers')
      .update({
        status: 'active',
        verified: true,
        verified_at: new Date().toISOString(),
        polar_customer_id: customerId,
        polar_subscription_id: subscription.id,
        subscription_started_at: subscription.started_at || new Date().toISOString(),
        subscription_ends_at: subscription.current_period_end || null
      })
      .eq('polar_checkout_id', checkoutId)
      .select()
    
    if (error) {
      console.error('Failed to activate provider:', error)
      throw error
    }
    
    if (!data || data.length === 0) {
      if (metadata.provider_type && metadata.company_name) {
        await createProviderFromMetadata(subscription)
      }
    }
  }
}

async function handleSubscriptionCanceled(event: any) {
  const subscription = event.data
  
  const { error } = await supabaseAdmin
    .from('providers')
    .update({
      status: event.type === 'subscription.revoked' ? 'expired' : 'cancelled'
    })
    .eq('polar_subscription_id', subscription.id)
  
  if (error) {
    console.error('Failed to update canceled subscription:', error)
    throw error
  }
}

async function createProviderFromMetadata(subscription: any) {
  const metadata = subscription.metadata || {}
  
  const { error } = await supabaseAdmin
    .from('providers')
    .insert({
      polar_customer_id: subscription.customer_id,
      polar_subscription_id: subscription.id,
      email: metadata.email,
      type: metadata.provider_type,
      name: metadata.company_name,
      bio: metadata.bio || '',
      country: metadata.country,
      ports: metadata.ports ? metadata.ports.split(',').map((p: string) => p.trim()) : [],
      phone: metadata.phone || null,
      whatsapp: metadata.whatsapp || null,
      website: metadata.website || null,
      address: metadata.address || null,
      contact_person: metadata.contact_person || null,
      svc: metadata.svc ? metadata.svc.split(',').map((s: string) => s.trim()) : null,
      plan: metadata.plan || null,
      status: 'active',
      verified: true,
      verified_at: new Date().toISOString(),
      subscription_started_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Failed to create provider from metadata:', error)
    throw error
  }
}
