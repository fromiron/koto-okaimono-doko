import { create } from 'zustand';

type CouponFilter = 'all' | 'ab' | 'b_only';
type PaymentFilter = 'all' | 'paper' | 'digital';
type RadiusMeters = 300 | 500 | 1000 | 2000;

type FilterState = {
  keyword: string;
  couponType: CouponFilter;
  payment: PaymentFilter;
  categoryMajorId: string | null;
  radiusMeters: RadiusMeters;
  setKeyword: (keyword: string) => void;
  setCouponType: (couponType: CouponFilter) => void;
  setPayment: (payment: PaymentFilter) => void;
  setCategoryMajorId: (categoryMajorId: string | null) => void;
  setRadiusMeters: (radiusMeters: RadiusMeters) => void;
  reset: () => void;
};

const initialState = {
  keyword: '',
  couponType: 'all' as const,
  payment: 'all' as const,
  categoryMajorId: null,
  radiusMeters: 500 as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setKeyword: (keyword) => set({ keyword }),
  setCouponType: (couponType) => set({ couponType }),
  setPayment: (payment) => set({ payment }),
  setCategoryMajorId: (categoryMajorId) => set({ categoryMajorId }),
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),
  reset: () => set(initialState),
}));
