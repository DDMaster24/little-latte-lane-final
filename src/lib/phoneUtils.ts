/**
 * South African Phone Number Utilities
 */

export function formatSouthAfricanPhone(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different input formats
  let normalized = '';

  if (cleaned.startsWith('27')) {
    // Starts with country code (27)
    normalized = cleaned;
  } else if (cleaned.startsWith('0')) {
    // Starts with 0 (local format) - convert to international
    normalized = '27' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    // 9 digits without leading 0 or country code
    normalized = '27' + cleaned;
  } else {
    // Invalid format
    return null;
  }

  // Validate South African mobile number format
  // SA mobile numbers: 27 + 9 digits (starting with 6, 7, 8)
  const saPattern = /^27[6-8]\d{8}$/;

  if (!saPattern.test(normalized)) {
    return null;
  }

  return normalized;
}

export function isValidSouthAfricanPhone(phone: string): boolean {
  return formatSouthAfricanPhone(phone) !== null;
}

export function displaySouthAfricanPhone(phone: string): string {
  const formatted = formatSouthAfricanPhone(phone);
  if (!formatted) return phone;

  // Format as: +27 XX XXX XXXX
  return `+${formatted.substring(0, 2)} ${formatted.substring(2, 4)} ${formatted.substring(4, 7)} ${formatted.substring(7)}`;
}

// Examples of valid inputs that will be accepted:
// "0823456789" -> "27823456789"
// "27823456789" -> "27823456789"
// "+27 82 345 6789" -> "27823456789"
// "082 345 6789" -> "27823456789"
// "82 345 6789" -> "27823456789"
