import { createHash } from 'crypto';

/**
 * PayFast Integration Service - Following Official Documentation
 *
 * This implementation follows the exact PayFast signature generation process as documented at:
 * https://developers.payfast.co.za/docs#home
 *
 * Key Points:
 * 1. Signature generation uses the EXACT field order specified by PayFast
 * 2. Values are URL encoded using encodeURIComponent()
 * 3. Passphrase is appended if present: &passphrase=encoded_passphrase
 * 4. Final string is MD5 hashed to create signature
 */

export interface PayFastPaymentData {
  // Core required fields - ONLY THESE are required for basic payments
  merchant_id: string;
  merchant_key: string;
  amount: string;
  item_name: string;
  signature: string;

  // Previously required fields now optional for simplified mode
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  m_payment_id?: string;

  // Customer details (optional)
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;

  // Transaction details (optional)
  item_description?: string;

  // Custom fields (optional)
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;

  // Optional fields
  email_confirmation?: string;
  confirmation_address?: string;
  payment_method?: string;
}

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox: boolean;
  debug?: boolean;
}

/**
 * PayFast official field order for signature generation
 * This is the EXACT order specified in PayFast documentation
 * Source: https://developers.payfast.co.za/docs#step_1_form_fields
 */
const PAYFAST_FIELD_ORDER = [
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
  'email_confirmation',
  'confirmation_address',
  'payment_method',
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
];

export class PayFastService {
  private config: PayFastConfig;

  constructor(config: PayFastConfig) {
    this.config = config;
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[PayFast]', ...args);
    }
  }

  /**
   * Get the PayFast payment URL (sandbox or live)
   */
  getPaymentUrl(): string {
    return this.config.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  /**
   * PHP urlencode() compatible function for PayFast signature generation
   * PayFast uses PHP urlencode() which has different behavior than JavaScript encodeURIComponent():
   * - Spaces become '+' (not '%20')
   * - Brackets () become '%28%29' (JavaScript leaves them as literal)
   * - Uses UPPERCASE hex encoding (JavaScript uses lowercase)
   * - Other special chars encoded differently
   *
   * Based on PayFast official documentation requirement:
   * "The resultant URL encoding must be in upper case (eg. http%3A%2F%2F), and spaces encoded as '+'"
   */
  private phpUrlencode(str: string): string {
    return str
      .split('')
      .map((char) => {
        // Letters and numbers - keep as is
        if (/[A-Za-z0-9]/.test(char)) return char;

        // Safe characters that PHP urlencode doesn't encode (hyphen, underscore, period)
        if (['-', '_', '.'].includes(char)) return char;

        // Spaces become +
        if (char === ' ') return '+';

        // Everything else gets percent-encoded in UPPERCASE (including brackets!)
        const code = char.charCodeAt(0);
        return '%' + code.toString(16).toUpperCase().padStart(2, '0');
      })
      .join('');
  }

  /**
   * Generate signature following PayFast official documentation
   * Steps:
   * 1. Concatenate name=value pairs in the exact PayFast field order
   * 2. URL encode values using PHP urlencode() compatible function
   * 3. Join with '&' separator
   * 4. Add passphrase if present: &passphrase=urlencode(YOUR_PASSPHRASE)
   * 5. Generate MD5 hash (lowercase)
   */
  public generateSignature(data: Record<string, unknown>): string {
    const pairs: string[] = [];

    // Process fields in exact PayFast order
    for (const field of PAYFAST_FIELD_ORDER) {
      const value = data[field];
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        // Use PHP urlencode() compatible encoding
        const encodedValue = this.phpUrlencode(String(value).trim());
        pairs.push(`${field}=${encodedValue}`);
      }
    }

    // Create parameter string
    let paramString = pairs.join('&');

    // Add passphrase if present (also PHP urlencode)
    if (this.config.passphrase && this.config.passphrase.trim() !== '') {
      paramString += `&passphrase=${this.phpUrlencode(this.config.passphrase.trim())}`;
    }

    // Generate MD5 hash (lowercase)
    const signature = createHash('md5').update(paramString).digest('hex');

    this.log('=== SIGNATURE GENERATION ===');
    this.log('Parameter string:', paramString);
    this.log('Generated signature:', signature);
    this.log('============================');

    return signature;
  }

  /**
   * Create payment data for PayFast checkout form - SIMPLIFIED VERSION
   */
  createPaymentData({
    orderId,
    userId,
    amount,
    itemName,
    itemDescription,
    returnUrl,
    cancelUrl,
    notifyUrl,
    userEmail,
    userFirstName,
    userLastName,
    userPhone,
  }: {
    orderId: number;
    userId?: string;
    amount: number;
    itemName: string;
    itemDescription?: string;
    userEmail?: string;
    userFirstName?: string;
    userLastName?: string;
    userPhone?: string;
    deliveryType?: string;
    deliveryAddress?: string;
    returnUrl?: string;
    cancelUrl?: string;
    notifyUrl?: string;
  }): PayFastPaymentData {
    this.log('=== PAYFAST PAYMENT DATA CREATION START ===');
    this.log('Environment:', this.config.sandbox ? 'SANDBOX' : 'LIVE');
    this.log('Merchant ID:', this.config.merchantId);
    this.log('Merchant Key:', this.config.merchantKey);
    this.log('Passphrase:', this.config.passphrase ? '[SET]' : '[NOT SET]');
    this.log('Creating payment data for order:', orderId);
    this.log('Amount (raw):', amount);
    this.log('Amount (formatted):', amount.toFixed(2));

    // Validate amount for live mode (stricter validation)
    if (!this.config.sandbox) {
      if (isNaN(amount) || amount <= 0 || amount > 999999.99) {
        throw new Error(
          `Invalid amount for live PayFast: ${amount}. Must be between 0.01 and 999999.99`
        );
      }
    }

    // Create SIMPLIFIED payment data with ONLY essential fields + return URLs + payment ID
    const paymentData: Record<string, string> = {
      // Core required fields ONLY
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      amount: amount.toFixed(2), // Ensure 2 decimal places for live mode
      item_name: itemName.trim(), // Trim whitespace for live mode
    };

    // PHASE 1: Adding return URLs (most important for PayFast) - only if provided
    if (returnUrl) {
      paymentData.return_url = returnUrl.trim();
      this.log('Added return_url:', returnUrl.trim());
    }
    if (cancelUrl) {
      paymentData.cancel_url = cancelUrl.trim();
      this.log('Added cancel_url:', cancelUrl.trim());
    }
    if (notifyUrl) {
      paymentData.notify_url = notifyUrl.trim();
      this.log('Added notify_url:', notifyUrl.trim());
    }

    // PHASE 2: Adding unique payment identifier
    const paymentId = `LLL-${orderId}-${Date.now()}`;
    paymentData.m_payment_id = paymentId;
    this.log('Added m_payment_id:', paymentId);

    // PHASE 3: Adding customer details (only if provided and valid)
    if (userEmail && userEmail.includes('@')) {
      paymentData.email_address = userEmail.trim();
      this.log('Added email_address:', userEmail.trim());
    }
    if (userFirstName && userFirstName.trim().length > 0) {
      paymentData.name_first = userFirstName.trim();
      this.log('Added name_first:', userFirstName.trim());
    }
    if (userLastName && userLastName.trim().length > 0) {
      paymentData.name_last = userLastName.trim();
      this.log('Added name_last:', userLastName.trim());
    }

    // PHASE 4A: Item description (FIXED - no parentheses, trimmed)
    if (itemDescription && itemDescription.trim().length > 0) {
      paymentData.item_description = itemDescription.trim();
      this.log('Added item_description:', itemDescription.trim());
    }

    // PHASE 4B: Adding phone number (cleaned format for live mode)
    if (userPhone && userPhone.trim().length > 0) {
      // Clean phone number for live mode - remove spaces, dashes, brackets
      const cleanPhone = userPhone.replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length >= 10) {
        paymentData.cell_number = cleanPhone;
        this.log('Added cell_number (cleaned):', cleanPhone);
      } else {
        this.log('Phone number too short, skipping:', cleanPhone);
      }
    }

    // PHASE 5: CRITICAL - Add custom fields for webhook identification
    // These are essential for the webhook to identify the order and user
    paymentData.custom_int1 = String(orderId); // Order ID for webhook
    paymentData.custom_str1 = userId || ''; // User ID for webhook
    this.log('✅ CRITICAL: Added custom_int1 (orderId):', String(orderId));
    this.log('✅ CRITICAL: Added custom_str1 (userId):', userId || '');

    this.log('Payment data before signature:', paymentData);
    this.log('Total fields before signature:', Object.keys(paymentData).length);

    // Generate signature using payment data
    const signature = this.generateSignature(paymentData);

    // Return complete payment data with signature
    const completePaymentData = {
      ...paymentData,
      signature,
    } as PayFastPaymentData;

    this.log('=== FINAL PAYMENT DATA ===');
    this.log('Environment:', this.config.sandbox ? 'SANDBOX' : 'LIVE');
    this.log('Total fields:', Object.keys(completePaymentData).length);
    this.log('Amount:', completePaymentData.amount);
    this.log('Signature:', completePaymentData.signature);
    this.log('Merchant ID:', completePaymentData.merchant_id);
    this.log('Payment ID:', completePaymentData.m_payment_id);
    this.log(
      'Complete payment data:',
      JSON.stringify(completePaymentData, null, 2)
    );
    this.log('=== PAYFAST PAYMENT DATA CREATION COMPLETE ===');

    return completePaymentData;
  }

  /**
   * Verify PayFast ITN (Instant Transaction Notification) signature
   * For ITN, signatures are generated alphabetically sorted by field name
   */
  verifyNotification(notificationData: Record<string, string>): boolean {
    if (!notificationData.signature) {
      this.log('No signature in notification data');
      return false;
    }

    const { signature, ...dataWithoutSignature } = notificationData;

    // For ITN verification, sort fields alphabetically
    const sortedFields = Object.keys(dataWithoutSignature).sort();
    const pairs: string[] = [];

    for (const field of sortedFields) {
      const value = dataWithoutSignature[field];
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        const encodedValue = this.phpUrlencode(String(value).trim());
        pairs.push(`${field}=${encodedValue}`);
      }
    }

    let paramString = pairs.join('&');

    if (this.config.passphrase) {
      paramString += `&passphrase=${this.phpUrlencode(this.config.passphrase.trim())}`;
    }

    const calculatedSignature = createHash('md5')
      .update(paramString)
      .digest('hex');
    const isValid = signature === calculatedSignature;

    this.log('=== ITN VERIFICATION ===');
    this.log('Received signature:', signature);
    this.log('Calculated signature:', calculatedSignature);
    this.log('Parameter string:', paramString);
    this.log('Valid:', isValid);
    this.log('========================');

    return isValid;
  }

  /**
   * Check if IP is from PayFast servers (basic security check)
   */
  isValidPayFastIP(ip: string): boolean {
    const validRanges = [
      '197.97.145.144', // to .159
      '41.74.179.192', // to .223
      '102.216.36.0', // to .15
      '102.216.36.128', // to .143
      '144.126.193.139',
    ];

    return validRanges.some((validIP) =>
      ip.startsWith(validIP.substring(0, validIP.lastIndexOf('.')))
    );
  }
}
// Create a singleton instance with enhanced debugging for live mode
export const payfast = new PayFastService({
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase:
    process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_MERCHANT_SALT,
  sandbox: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true',
  debug:
    process.env.PAYFAST_DEBUG === 'true' ||
    process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'false', // Enable debug for live mode
});
