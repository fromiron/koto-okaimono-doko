import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createStoreRepository } from './StoreRepository';

export function useStoreRepository() {
  const db = useSQLiteContext();
  return useMemo(() => createStoreRepository(db), [db]);
}
