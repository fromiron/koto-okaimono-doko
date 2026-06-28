import type { Store, StoreWithDistance } from './store';
import type { DatasetMeta } from './dataset';

export type StoreSearchParams = {
  keyword?: string;
  couponType?: 'all' | 'ab' | 'b_only';
  payment?: 'all' | 'paper' | 'digital';
  categoryMajorId?: string | null;
  categoryMinorId?: string | null;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  limit?: number;
};

export type NearbySearchParams = {
  lat: number;
  lng: number;
  radiusMeters: number;
  filters?: StoreSearchParams;
};

export interface StoreRepository {
  getStoreById(id: string): Promise<Store | null>;
  searchStores(params: StoreSearchParams): Promise<Store[]>;
  findNearbyStores(params: NearbySearchParams): Promise<StoreWithDistance[]>;
  getDatasetMeta(): Promise<DatasetMeta>;
}
