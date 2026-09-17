import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { propertyId, amount, ownerId } = await req.json();

    const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
    
    // In production, this should be https://api.phonepe.com/apis/hermes/pg/v1/pay
    const PHONEPE_URL = process.env.PHONEPE_ENV === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    // Base URL of our app for redirect
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://staynox.vercel.app';
    const transactionId = `T${Date.now()}`;
    const merchantUserId = `MUID${ownerId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`;

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: merchantUserId,
      amount: amount * 100, // PhonePe takes amount in paise
      redirectUrl: `${baseUrl}/api/phonepe/callback?id=${transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/phonepe/callback`,
      mobileNumber: '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Encode payload to base64
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Create checksum: sha256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
    const stringToSign = base64Payload + '/pg/v1/pay' + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
    const checksum = sha256 + '###' + SALT_INDEX;

    // Call PhonePe API
    const response = await fetch(PHONEPE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': MERCHANT_ID
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();

    if (data.success && data.data && data.data.instrumentResponse) {
      // Pass the redirectInfo URL back to client
      return NextResponse.json({ 
        success: true, 
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
        transactionId
      });
    } else {
      console.error('PhonePe error:', data);
      return NextResponse.json({ success: false, message: 'PhonePe API Error' }, { status: 400 });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
