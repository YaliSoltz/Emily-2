/**
 * Validates Israeli phone numbers.
 * Accepts local and international formats with spaces, dashes, and parentheses.
 * Valid examples: 050-1234567, 03-1234567, +972-50-1234567
 */
export function isValidIsraeliPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-().+]/g, '')
  return (
    /^05\d{8}$/.test(digits) ||       // mobile:               050-1234567
    /^0[234789]\d{7}$/.test(digits) || // landline:             03-1234567
    /^9725\d{8}$/.test(digits) ||      // intl mobile:   +972-50-1234567
    /^972[234789]\d{7}$/.test(digits)  // intl landline: +972-3-1234567
  )
}
