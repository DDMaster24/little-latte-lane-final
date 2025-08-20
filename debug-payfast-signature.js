require('dotenv').config({ path: '.env.local' });
const { createHash } = require('crypto');

// PayFast notification data from the error logs (EXACT as received)
const notificationData = {
  "m_payment_id": "LLL-98edec77-3e54-4be5-8441-4c478755346e-1755677333531",
  "pf_payment_id": "243623825",
  "payment_status": "COMPLETE",
  "item_name": "Little Latte Lane Order #98edec77-3e54-4be5-8441-4c478755346e",
  "item_description": "Cafe Latte x1",
  "amount_gross": "37.00",
  "amount_fee": "-3.66",
  "amount_net": "33.34",
  "custom_str1": "98edec77-3e54-4be5-8441-4c478755346e",
  "custom_str2": "088e633c-6e32-49ac-b2b3-508cb0e6153c",
  "custom_str3": "",
  "custom_str4": "",
  "custom_str5": "",
  "custom_int1": "1755677333531",
  "custom_int2": "",
  "custom_int3": "",
  "custom_int4": "",
  "custom_int5": "",
  "name_first": "Darius",
  "name_last": "Schutte",
  "email_address": "dariusschutte124@gmail.com",
  "merchant_id": "31225525",
  "signature": "15909b611cb4857f2b5d70529d8e546f"
};

// PayFast environment config
const payfastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID,
  merchantKey: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true'
};

console.log('🔧 PayFast Configuration:');
console.log('- Merchant ID:', payfastConfig.merchantId);
console.log('- Merchant Key:', payfastConfig.merchantKey);
console.log('- Passphrase:', payfastConfig.passphrase ? '[SET]' : '[NOT SET]');
console.log('- Sandbox Mode:', payfastConfig.sandbox);
console.log('');

// PHP urlencode() compatible function
function phpUrlencode(str) {
  return str
    .split('')
    .map((char) => {
      if (/[A-Za-z0-9]/.test(char)) return char;
      if (['-', '_', '.'].includes(char)) return char;
      if (char === ' ') return '+';
      const code = char.charCodeAt(0);
      return '%' + code.toString(16).toUpperCase().padStart(2, '0');
    })
    .join('');
}

function verifyNotificationSignature(notificationData) {
  const { signature, ...dataWithoutSignature } = notificationData;
  
  console.log('📋 Notification Data (without signature):');
  console.log(JSON.stringify(dataWithoutSignature, null, 2));
  console.log('');
  
  console.log('🔐 Received Signature:', signature);
  console.log('');

  // For ITN verification, sort fields alphabetically (as per PayFast docs)
  const sortedFields = Object.keys(dataWithoutSignature).sort();
  console.log('📝 Sorted Fields:', sortedFields);
  console.log('');

  const pairs = [];
  
  console.log('🔍 Building Parameter String:');
  for (const field of sortedFields) {
    const value = dataWithoutSignature[field];
    // PayFast includes ALL fields, even empty ones in signature calculation
    if (value !== undefined && value !== null) {
      const encodedValue = phpUrlencode(String(value).trim());
      const pair = `${field}=${encodedValue}`;
      pairs.push(pair);
      console.log(`   ${pair}`);
    }
  }

  let paramString = pairs.join('&');
  console.log('');
  console.log('🔗 Parameter String (before passphrase):', paramString);

  // Test without passphrase first (some ITN don't include passphrase in LIVE mode)
  const signatureWithoutPassphrase = createHash('md5').update(paramString).digest('hex');
  console.log('🧮 Signature WITHOUT passphrase:', signatureWithoutPassphrase);
  console.log('✅ Match WITHOUT passphrase:', signature === signatureWithoutPassphrase);

  // NOTE: PayFast LIVE ITN might NOT use passphrase - test both ways
  let finalResult = signature === signatureWithoutPassphrase;

  // Add passphrase if present (but might not be used for ITN in live mode)
  if (payfastConfig.passphrase) {
    paramString += `&passphrase=${phpUrlencode(payfastConfig.passphrase.trim())}`;
    console.log('🔑 Parameter String (with passphrase):', paramString);
    
    // Generate MD5 hash with passphrase
    const calculatedSignature = createHash('md5').update(paramString).digest('hex');
    console.log('🧮 Calculated Signature (with passphrase):', calculatedSignature);
    console.log('✅ Signatures Match (with passphrase):   ', signature === calculatedSignature);
    
    finalResult = finalResult || signature === calculatedSignature;
  } else {
    console.log('⚠️ No passphrase configured');
  }

  console.log('');
  console.log('📨 Received Signature:                    ', signature);
  console.log('🎯 Final Result (either method):          ', finalResult);
  
  return finalResult;
}

console.log('🧪 Testing PayFast Signature Verification...\n');
const isValid = verifyNotificationSignature(notificationData);
console.log(`\n🎯 Final Result: ${isValid ? 'VALID' : 'INVALID'}`);

if (!isValid) {
  console.log('\n❌ SIGNATURE VERIFICATION FAILED!');
  console.log('Possible causes:');
  console.log('1. Incorrect passphrase');
  console.log('2. Different URL encoding method');
  console.log('3. Field order issue');
  console.log('4. Missing/extra fields');
  console.log('5. Merchant credentials mismatch');
}
