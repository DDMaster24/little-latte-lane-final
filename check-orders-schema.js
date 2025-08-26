#!/usr/bin/env node

/**
 * Check orders table schema to see what columns exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || supabaseServiceKey) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('🔍 Checking orders table schema...');
  
  // Get table schema information
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('❌ Error:', error);
  } else if (data && data.length > 0) {
    console.log('📋 Orders table columns:');
    Object.keys(data[0]).forEach(column => {
      console.log(`  - ${column}: ${typeof data[0][column]}`);
    });
  } else {
    console.log('📋 No orders found to check schema');
  }
  
  // Also try to get one recent order to see its structure
  console.log('\n📋 Recent order sample:');
  const { data: recent, error: recentError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (recentError) {
    console.error('❌ Recent order error:', recentError);
  } else if (recent && recent.length > 0) {
    console.log('Sample order structure:');
    console.log(JSON.stringify(recent[0], null, 2));
  }
}
