/**
 * Profile Phone Field Usage Guidelines
 * 
 * IMPORTANT: Use the `phone` field, NOT `phone_number`
 * 
 * Current Database Schema (Supabase):
 * - ✅ `phone: string | null` - ACTIVE field, used throughout application
 * - ❌ `phone_number: string | null` - UNUSED legacy field, ignore this
 * 
 * Application Usage:
 * - All forms save to `phone` field
 * - All displays read from `phone` field
 * - Phone validation/formatting works with `phone` field
 * 
 * TODO: Remove `phone_number` field from database schema in future migration
 * 
 * Examples:
 * ```typescript
 * // ✅ Correct - use phone field
 * const userPhone = profile.phone;
 * await supabase.from('profiles').update({ phone: formattedPhone });
 * 
 * // ❌ Incorrect - don't use phone_number field
 * const userPhone = profile.phone_number; // DON'T DO THIS
 * ```
 */
export const PHONE_FIELD_USAGE = {
  ACTIVE_FIELD: 'phone' as const,
  LEGACY_FIELD: 'phone_number' as const, // Don't use this
  RECOMMENDATION: 'Always use the phone field for all phone-related operations'
} as const;
