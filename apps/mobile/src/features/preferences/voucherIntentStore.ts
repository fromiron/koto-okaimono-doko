import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoucherIntentSchema, type VoucherIntent } from '@koto/schema';
import { create } from 'zustand';

export const VOUCHER_INTENT_STORAGE_KEY = 'koto.voucherIntent';
export const defaultVoucherIntent: VoucherIntent = {
  medium: 'any',
  voucher: 'any',
};

type VoucherIntentState = {
  intent: VoucherIntent;
  now: Date;
  saveFailed: boolean;
  hydrate: () => Promise<void>;
  setIntent: (intent: VoucherIntent) => Promise<boolean>;
};

export const useVoucherIntentStore = create<VoucherIntentState>((set) => ({
  intent: defaultVoucherIntent,
  now: new Date(),
  saveFailed: false,
  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(VOUCHER_INTENT_STORAGE_KEY);
      const parsed = VoucherIntentSchema.safeParse(
        stored === null ? defaultVoucherIntent : JSON.parse(stored),
      );
      set({ intent: parsed.success ? parsed.data : defaultVoucherIntent });
    } catch {
      // A preference read failure must not block offline browsing.
      set({ intent: defaultVoucherIntent });
    }
  },
  setIntent: async (intent) => {
    try {
      const parsed = VoucherIntentSchema.parse(intent);
      await AsyncStorage.setItem(
        VOUCHER_INTENT_STORAGE_KEY,
        JSON.stringify(parsed),
      );
      set({ intent: parsed, saveFailed: false });
      return true;
    } catch {
      set({ saveFailed: true });
      return false;
    }
  },
}));
