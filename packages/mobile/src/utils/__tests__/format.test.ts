import { formatCurrency, fullName } from '@/utils/format';

describe('format utils', () => {
  it('formats currency', () => {
    expect(formatCurrency(123.45)).toContain('$123.45');
  });

  it('builds a full name', () => {
    expect(fullName('Ada', 'Lovelace')).toBe('Ada Lovelace');
  });
});
