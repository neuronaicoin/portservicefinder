import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', test: 'webhook-alive' })
}

export async function POST() {
  return NextResponse.json({ received: true })
}
