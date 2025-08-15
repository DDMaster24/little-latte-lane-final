import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * PayFast Signature Verification API
 * Tests exact signature generation according to PayFast documentation
 */

interface PayFastTestData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description: string;
  custom_int1: string;
  custom_str1: string;
}

export async function POST(request: NextRequest) {
  console.log('🔍 === PayFast Signature Verification API START ===');

  try {
    const body = await request.json();
    console.log('📥 Received request body:', JSON.stringify(body, null, 2));

    // Test data based on PayFast documentation examples
    const testData: PayFastTestData = {
      // Required merchant fields (from our config)
      merchant_id: '10041105',
      merchant_key: 'v811l5d8mg7l4',

      // URLs
      return_url: 'http://localhost:3001/payfast/return',
      cancel_url: 'http://localhost:3001/payfast/cancel',
      notify_url: 'http://localhost:3001/api/payfast/notify',

      // Customer details
      name_first: 'John',
      name_last: 'Doe',
      email_address: 'john@example.com',

      // Transaction details
      m_payment_id: '12345',
      amount: '100.00',
      item_name: 'Test Product',
      item_description: 'Test Description',

      // Custom fields
      custom_int1: '1',
      custom_str1: 'test_user',
    };

    console.log('📋 Test data created:', JSON.stringify(testData, null, 2));

    // Test different signature generation approaches
    const results = {
      method1_documentation_order: testDocumentationOrderSignature(testData),
      method2_minimal_fields: testMinimalFieldsSignature(testData),
      method3_all_fields_doc_order: testAllFieldsDocOrderSignature(testData),
      method4_url_encoded: testUrlEncodedSignature(testData),
    };

    console.log(
      '📊 All signature generation results:',
      JSON.stringify(results, null, 2)
    );
    console.log('🔍 === PayFast Signature Verification API END ===');

    return NextResponse.json({
      success: true,
      testData,
      signatureResults: results,
      message:
        'Signature verification completed. Check console for detailed logs.',
    });
  } catch (error) {
    console.error('❌ Error in PayFast signature verification:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify signatures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Method 1: Exact PayFast Documentation Order
 * Based on field order from PayFast docs: Merchant Details → Customer Details → Transaction Details
 */
function testDocumentationOrderSignature(data: PayFastTestData): {
  method: string;
  queryString: string;
  stringToSign: string;
  signature: string;
  fieldCount: number;
} {
  console.log('🎯 Testing Method 1: Documentation Order');

  // Exact field order from PayFast documentation
  const fieldOrder = [
    'merchant_id', // Merchant details first
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first', // Customer details second
    'name_last',
    'email_address',
    'm_payment_id', // Transaction details third
    'amount',
    'item_name',
    'item_description',
    'custom_int1', // Custom fields last
    'custom_str1',
  ];

  const queryParts: string[] = [];
  fieldOrder.forEach((field) => {
    if (
      data[field as keyof PayFastTestData] &&
      String(data[field as keyof PayFastTestData]).trim() !== ''
    ) {
      const value = String(data[field as keyof PayFastTestData]).trim();
      // PayFast docs: spaces as + (not %20)
      const encodedValue = value.replace(/ /g, '+');
      queryParts.push(`${field}=${encodedValue}`);
    }
  });

  const queryString = queryParts.join('&');
  const passphrase = 'LLL2025_1df4b3cd2a8a';
  const stringToSign = `${queryString}&passphrase=${passphrase}`;
  const signature = createHash('md5').update(stringToSign).digest('hex');

  console.log('📝 Method 1 - Query string:', queryString);
  console.log('🔐 Method 1 - String to sign:', stringToSign);
  console.log('🎯 Method 1 - Signature:', signature);

  return {
    method: 'Documentation Order (Merchant → Customer → Transaction)',
    queryString,
    stringToSign,
    signature,
    fieldCount: queryParts.length,
  };
}

/**
 * Method 2: Minimal Fields Only (Current Implementation)
 * Only merchant_id, merchant_key, amount, item_name
 */
function testMinimalFieldsSignature(data: PayFastTestData): {
  method: string;
  queryString: string;
  stringToSign: string;
  signature: string;
  fieldCount: number;
} {
  console.log('🎯 Testing Method 2: Minimal Fields');

  const minimalData = {
    merchant_id: data.merchant_id,
    merchant_key: data.merchant_key,
    amount: data.amount,
    item_name: data.item_name,
  };

  const queryParts: string[] = [];
  Object.entries(minimalData).forEach(([key, value]) => {
    if (value && String(value).trim() !== '') {
      const encodedValue = String(value).trim().replace(/ /g, '+');
      queryParts.push(`${key}=${encodedValue}`);
    }
  });

  const queryString = queryParts.join('&');
  const passphrase = 'LLL2025_1df4b3cd2a8a';
  const stringToSign = `${queryString}&passphrase=${passphrase}`;
  const signature = createHash('md5').update(stringToSign).digest('hex');

  console.log('📝 Method 2 - Query string:', queryString);
  console.log('🔐 Method 2 - String to sign:', stringToSign);
  console.log('🎯 Method 2 - Signature:', signature);

  return {
    method: 'Minimal Fields (4 fields only)',
    queryString,
    stringToSign,
    signature,
    fieldCount: queryParts.length,
  };
}

/**
 * Method 3: All Non-Empty Fields in Documentation Order
 * Include all provided fields in correct documentation order
 */
function testAllFieldsDocOrderSignature(data: PayFastTestData): {
  method: string;
  queryString: string;
  stringToSign: string;
  signature: string;
  fieldCount: number;
} {
  console.log('🎯 Testing Method 3: All Fields Documentation Order');

  // Complete field order from PayFast docs
  const completeFieldOrder = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'cell_number',
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
    'custom_int1',
    'custom_int2',
    'custom_int3',
    'custom_int4',
    'custom_int5',
    'custom_str1',
    'custom_str2',
    'custom_str3',
    'custom_str4',
    'custom_str5',
    'email_confirmation',
    'confirmation_address',
    'payment_method',
  ];

  const queryParts: string[] = [];
  completeFieldOrder.forEach((field) => {
    const value = data[field as keyof PayFastTestData];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      const encodedValue = String(value).trim().replace(/ /g, '+');
      queryParts.push(`${field}=${encodedValue}`);
    }
  });

  const queryString = queryParts.join('&');
  const passphrase = 'LLL2025_1df4b3cd2a8a';
  const stringToSign = `${queryString}&passphrase=${passphrase}`;
  const signature = createHash('md5').update(stringToSign).digest('hex');

  console.log('📝 Method 3 - Query string:', queryString);
  console.log('🔐 Method 3 - String to sign:', stringToSign);
  console.log('🎯 Method 3 - Signature:', signature);

  return {
    method: 'All Fields Documentation Order',
    queryString,
    stringToSign,
    signature,
    fieldCount: queryParts.length,
  };
}

/**
 * Method 4: URL Encoded Approach
 * Use proper URL encoding (encodeURIComponent)
 */
function testUrlEncodedSignature(data: PayFastTestData): {
  method: string;
  queryString: string;
  stringToSign: string;
  signature: string;
  fieldCount: number;
} {
  console.log('🎯 Testing Method 4: URL Encoded');

  const fieldOrder = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
    'custom_int1',
    'custom_str1',
  ];

  const queryParts: string[] = [];
  fieldOrder.forEach((field) => {
    const value = data[field as keyof PayFastTestData];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      const encodedValue = encodeURIComponent(String(value).trim());
      queryParts.push(`${field}=${encodedValue}`);
    }
  });

  const queryString = queryParts.join('&');
  const passphrase = 'LLL2025_1df4b3cd2a8a';
  const passphraseEncoded = encodeURIComponent(passphrase);
  const stringToSign = `${queryString}&passphrase=${passphraseEncoded}`;
  const signature = createHash('md5').update(stringToSign).digest('hex');

  console.log('📝 Method 4 - Query string:', queryString);
  console.log('🔐 Method 4 - String to sign:', stringToSign);
  console.log('🎯 Method 4 - Signature:', signature);

  return {
    method: 'URL Encoded (encodeURIComponent)',
    queryString,
    stringToSign,
    signature,
    fieldCount: queryParts.length,
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'PayFast Signature Verification API',
    description:
      'POST to this endpoint to test different signature generation methods',
    usage: 'POST /api/payfast-signature-verification',
  });
}
