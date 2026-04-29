import { validateZipCode, validateAddress } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateZipCode', () => {
    it('validates a standard 5-digit zip code', () => {
      const result = validateZipCode('90210');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('90210');
      }
    });

    it('validates a 9-digit zip code', () => {
      const result = validateZipCode('90210-1234');
      expect(result.success).toBe(true);
    });

    it('fails on invalid characters', () => {
      const result = validateZipCode('9021a');
      expect(result.success).toBe(false);
    });

    it('fails on wrong length', () => {
      const result = validateZipCode('1234');
      expect(result.success).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('validates a standard address', () => {
      const result = validateAddress('123 Main St, Springfield');
      expect(result.success).toBe(true);
    });

    it('fails if address is too short', () => {
      const result = validateAddress('123');
      expect(result.success).toBe(false);
    });

    it('fails if address contains invalid characters (e.g. script tags)', () => {
      const result = validateAddress('<script>alert(1)</script>');
      expect(result.success).toBe(false);
    });
  });
});
