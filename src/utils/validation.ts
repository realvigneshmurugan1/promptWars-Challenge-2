import { z } from 'zod';

export const ZipCodeSchema = z.string()
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, "Invalid US zip code format");

export const AddressSchema = z.string()
  .trim()
  .min(5, "Address must be at least 5 characters long")
  .max(100, "Address is too long")
  // Basic sanitization: alphanumeric, spaces, and common address punctuation
  .regex(/^[a-zA-Z0-9\s.,#-]+$/, "Address contains invalid characters");

export function validateZipCode(zip: string): { success: true; data: string } | { success: false; error: string } {
  const result = ZipCodeSchema.safeParse(zip);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error?.errors?.[0]?.message || 'Invalid zip code format' };
  }
}

export function validateAddress(address: string): { success: true; data: string } | { success: false; error: string } {
  const result = AddressSchema.safeParse(address);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error?.errors?.[0]?.message || 'Invalid address format' };
  }
}
