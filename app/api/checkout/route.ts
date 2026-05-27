import { NextRequest, NextResponse } from 'next/server'
import { Polar } from '@polar-sh/sdk'

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: 'sandbox', // TEST MODE - production'a geçince 'production' yap
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Form bilgilerini al
    const {
      provider_type,    // 'agent' | 'chandler' | 'service'
      company_name,
      bio,
      country,
      ports,            // array
      email,
      phone,
      whatsapp,
      website,
      address,
      contact_person,
      svc,              // array (chandler/service için)
      plan,             // 'monthly' | 'annual'
    } = body
    
    // Validation
    if (!provider_type || !company_name || !country || !ports || !email || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!['agent', 'chandler', 'service'].includes(provider_type)) {
      return NextResponse.json(
        { error: 'Invalid provider type' },
        { status: 400 }
      )
    }
    
    if (!['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }
    
    // Plan'a göre product ID seç
    const productId = plan === 'monthly'
      ? process.env.POLAR_PRODUCT_ID_MONTHLY!
      : process.env.POLAR_PRODUCT_ID_ANNUAL!
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product configuration error' },
        { status: 500 }
      )
    }
    
    // Polar'da checkout oluştur
    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: email,
      successUrl: 'https://www.portservicefinder.com/welcome',
      metadata: {
        provider_type,
        company_name,
        bio: bio || '',
        country,
        ports: Array.isArray(ports) ? ports.join(',') : ports,
        email,
        phone: phone || '',
        whatsapp: whatsapp || '',
        website: website || '',
        address: address || '',
        contact_person: contact_person || '',
        svc: Array.isArray(svc) ? svc.join(',') : (svc || ''),
        plan,
      },
    })
    
    return NextResponse.json({
      checkout_url: checkout.url,
      checkout_id: checkout.id,
    })
    
  } catch (error: any) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout', details: error.message },
      { status: 500 }
    )
  }
}

// GET için status endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'checkout',
    mode: 'sandbox',
  })
}
