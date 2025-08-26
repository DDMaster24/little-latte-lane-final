#!/usr/bin/env node

/**
 * Test server Supabase client vs service role client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing different Supabase client configurations...');

const targetOrderId = '1e4a68f6-3855-434f-a74f-aa0e89e1d67c';

async function testDifferentClients() {
  console.log('\n1️⃣ Testing SERVICE ROLE client...');
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', targetOrderId)
      .single();
      
    console.log('Service role result:', {
      success: !serviceError,
      error: serviceError?.message,
      data: serviceData
    });
  } catch (err) {
    console.error('Service role exception:', err);
  }
  
  console.log('\n2️⃣ Testing ANON KEY client...');
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: anonData, error: anonError } = await anonClient
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', targetOrderId)
      .single();
      
    console.log('Anon key result:', {
      success: !anonError,
      error: anonError?.message,
      code: anonError?.code,
      data: anonData
    });
  } catch (err) {
    console.error('Anon key exception:', err);
  }
  
  console.log('\n3️⃣ Testing SERVER CLIENT simulation...');
  // Simulate what happens in the webhook with server client
  const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    const { data: serverData, error: serverError } = await serverClient
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', targetOrderId)
      .single();
      
    console.log('Server simulation result:', {
      success: !serverError,
      error: serverError?.message,
      code: serverError?.code,
      data: serverData
    });
  } catch (err) {
    console.error('Server simulation exception:', err);
  }
  
  console.log('\n4️⃣ Testing RLS policies...');
  // Check if RLS is blocking the query
  console.log('Environment check:');
  console.log('- Service key available:', !!supabaseServiceKey);
  console.log('- Anon key available:', !!supabaseAnonKey);
  console.log('- URL:', supabaseUrl);
}

testDifferentClients().catch(console.error);
