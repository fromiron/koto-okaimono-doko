import { z } from 'zod';

export const VoucherIntentSchema = z.object({
  medium: z.enum(['any', 'paper', 'digital']),
  voucher: z.enum(['any', 'A', 'B']),
});

export type VoucherIntent = z.infer<typeof VoucherIntentSchema>;
