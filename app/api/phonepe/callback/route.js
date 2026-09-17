import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    // PhonePe sends form data on redirectMode: POST
    const formData = await req.formData();
    const code = formData.get('code');
    const merchantId = formData.get('merchantId');
    const transactionId = formData.get('transactionId');
    const providerReferenceId = formData.get('providerReferenceId');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://staynox.vercel.app';

    if (code === 'PAYMENT_SUCCESS') {
      // In a real production app, we MUST verify the payment status via S2S check status API here
      // using the transactionId before marking it successful in our DB.
      
      // For MVP, if code is PAYMENT_SUCCESS, we redirect to success dashboard.
      // We would also update the Supabase 'owners' table to 'active' here.
      // However, server-side Supabase updates require the Service Role key.
      // We will handle the database update securely via a service layer when production ready.
      
      return NextResponse.redirect(`${baseUrl}/owner/dashboard?payment=success&tx=${transactionId}`, { status: 302 });
    } else {
      return NextResponse.redirect(`${baseUrl}/owner/dashboard?payment=failed`, { status: 302 });
    }

  } catch (error) {
    console.error('Callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://staynox.vercel.app';
    return NextResponse.redirect(`${baseUrl}/owner/dashboard?payment=error`, { status: 302 });
  }
}
