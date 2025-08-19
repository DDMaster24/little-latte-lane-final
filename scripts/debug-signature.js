// PayFast Signature Debug Tool
// This will help us understand why signature verification is failing

const crypto = require('crypto');

// PayFast notification data from your logs
const notificationData = {
  "m_payment_id": "LLL-9389dbd4-8a0e-4b51-afbc-2471b028483b-1755605581687",
  "pf_payment_id": "243484757",
  "payment_status": "COMPLETE",
  "item_name": "Little Latte Lane Order #9389dbd4-8a0e-4b51-afbc-2471b028483b",
  "item_description": "Americano Regular x1",
  "amount_gross": "25.00",
  "amount_fee": "-3.22",
  "amount_net": "21.78",
  "custom_str1": "9389dbd4-8a0e-4b51-afbc-2471b028483b",
  "custom_str2": "508cbda9-5067-4b2c-a9fa-ffdbb665c5c9",
  "custom_str3": "",
  "custom_str4": "",
  "custom_str5": "",
  "custom_int1": "1755605581687",
  "custom_int2": "",
  "custom_int3": "",
  "custom_int4": "",
  "custom_int5": "",
  "name_first": "Darius",
  "name_last": "(Super Admin)",
  "email_address": "ddmaster124@gmail.com",
  "merchant_id": "31225525",
  "signature": "b26e43eb67358aa5bedb8933387e454c"
};

// Get passphrase from env
require('dotenv').config({ path: '.env.local' });
const passphrase = process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_MERCHANT_SALT;

console.log('🔍 PayFast Signature Debug Analysis\n');
console.log('Received signature:', notificationData.signature);
console.log('Passphrase:', passphrase ? '[SET]' : '[NOT SET]');
console.log('');

// PHP urlencode function
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

// Remove signature for calculation
const { signature, ...dataWithoutSignature } = notificationData;

// Sort fields alphabetically (PayFast ITN requirement)
const sortedFields = Object.keys(dataWithoutSignature).sort();
console.log('📋 Sorted fields:', sortedFields.join(', '));
console.log('');

// Build parameter string
const pairs = [];
for (const field of sortedFields) {
  const value = dataWithoutSignature[field];
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    const encodedValue = phpUrlencode(String(value).trim());
    pairs.push(`${field}=${encodedValue}`);
    console.log(`   ${field} = "${value}" → ${field}=${encodedValue}`);
  } else {
    console.log(`   ${field} = [EMPTY] → SKIPPED`);
  }
}

let paramString = pairs.join('&');
console.log('');
console.log('🔗 Parameter string (before passphrase):');
console.log(paramString);

// Add passphrase if present
if (passphrase && passphrase.trim() !== '') {
  paramString += `&passphrase=${phpUrlencode(passphrase.trim())}`;
  console.log('');
  console.log('🔗 Parameter string (with passphrase):');
  console.log(paramString);
}

// Calculate signature
const calculatedSignature = crypto.createHash('md5').update(paramString).digest('hex');

console.log('');
console.log('🎯 Results:');
console.log('Received signature:  ', notificationData.signature);
console.log('Calculated signature:', calculatedSignature);
console.log('Match:', notificationData.signature === calculatedSignature ? '✅ YES' : '❌ NO');

if (notificationData.signature !== calculatedSignature) {
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Check if passphrase is correct');
  console.log('2. Check if PayFast is sending unexpected fields');
  console.log('3. Check if character encoding is different');
  console.log('4. Check if PayFast signature generation changed');
}
