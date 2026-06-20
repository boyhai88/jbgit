import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook environment variables" },
      { status: 500 },
    )
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase service environment variables" },
      { status: 500 },
    )
  }

  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    )
  }

  const stripe = new Stripe(stripeSecretKey)
  const payload = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature" },
      { status: 400 },
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const customerEmail =
      session.customer_email || session.customer_details?.email || null
    const planType = session.metadata?.plan_type || "估值报告"

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400 },
      )
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await supabase.from("user_subscriptions").upsert(
      {
        user_email: customerEmail,
        plan_type: planType,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      {
        onConflict: "user_email",
      },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
