import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const code = formData.get('code');
    const transactionId = formData.get('transactionId') || '';
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://staynox.vercel.app';

    if (code === 'PAYMENT_SUCCESS') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Extract Owner ID from transactionId (e.g. T12345678_uuid-here)
      const parts = transactionId.split('_');
      if (parts.length > 1) {
        const ownerId = parts.slice(1).join('_');
        
        // Update database to mark as active
        await supabase
          .from('owners')
          .update({ subscription_status: 'active' })
          .eq('id', ownerId);
      }

      return NextResponse.redirect(\/owner/dashboard?payment=success&tx=\, { status: 302 });
    } else {
      return NextResponse.redirect(\/owner/dashboard?payment=failed, { status: 302 });
    }
  } catch (error) {
    console.error('Callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://staynox.vercel.app';
    return NextResponse.redirect(\/owner/dashboard?payment=error, { status: 302 });
  }
}
