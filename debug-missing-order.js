#!/usr/bin/env node

/**
 * Debug script to investigate missing order issue
 * This will check if the order exists and show us what's in the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMissingOrder() {
  console.log('🔍 DEBUG: Investigating missing order issue...');
  console.log('📅 Current time:', new Date().toISOString());
  
  const targetOrderId = '1e4a68f6-3855-434f-a74f-aa0e89e1d67c';
  
  console.log('\n1️⃣ Checking for exact order ID match...');
  const { data: exactOrder, error: exactError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', targetOrderId);
    
  console.log('Exact match result:', {
    found: exactOrder?.length || 0,
    error: exactError?.message,
    data: exactOrder
  });
  
  console.log('\n2️⃣ Checking recent orders (last 100)...');
  const { data: recentOrders, error: recentError } = await supabase
    .from('orders')
    .select('id, status, payment_status, created_at, total_amount')
    .order('created_at', { ascending: false })
    .limit(100);
    
  if (recentError) {
    console.error('❌ Error fetching recent orders:', recentError);
  } else {
    console.log(`📋 Found ${recentOrders.length} recent orders:`);
    recentOrders.forEach(order => {
      console.log(`  - ${order.id} | ${order.status} | ${order.payment_status} | ${order.created_at}`);
    });
    
    // Check if any order IDs are similar to target
    const similarOrders = recentOrders.filter(order => 
      order.id.includes('1e4a68f6') || 
      order.id.includes('3855') ||
      order.id.includes('434f')
    );
    
    if (similarOrders.length > 0) {
      console.log('\n🔍 Found orders with similar IDs:');
      similarOrders.forEach(order => {
        console.log(`  - ${order.id} | ${order.status} | ${order.payment_status}`);
      });
    }
  }
  
  console.log('\n3️⃣ Checking draft orders...');
  const { data: draftOrders, error: draftError } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (draftError) {
    console.error('❌ Error fetching draft orders:', draftError);
  } else {
    console.log(`📋 Found ${draftOrders.length} draft orders:`);
    draftOrders.forEach(order => {
      console.log(`  - ${order.id} | ${order.payment_status} | ${order.created_at} | Amount: ${order.total_amount}`);
    });
  }
  
  console.log('\n4️⃣ Checking for orders created in last hour...');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentOrdersHour, error: recentHourError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false });
    
  if (recentHourError) {
    console.error('❌ Error fetching recent hour orders:', recentHourError);
  } else {
    console.log(`📋 Found ${recentOrdersHour.length} orders in last hour:`);
    recentOrdersHour.forEach(order => {
      console.log(`  - ${order.id} | ${order.status} | ${order.payment_status} | ${order.created_at}`);
      if (order.id === targetOrderId) {
        console.log('    🎯 FOUND TARGET ORDER!');
      }
    });
  }
  
  console.log('\n5️⃣ Database connection test...');
  const { data: testData, error: testError } = await supabase
    .from('orders')
    .select('count(*)')
    .single();
    
  if (testError) {
    console.error('❌ Database connection error:', testError);
  } else {
    console.log('✅ Database connection working, total orders:', testData);
  }
  
  console.log('\n🔍 DEBUG COMPLETE');
}

debugMissingOrder().catch(console.error);
