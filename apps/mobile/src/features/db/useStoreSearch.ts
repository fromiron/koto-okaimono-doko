import type { Store, StoreRepository, StoreSearchParams } from '@koto/schema';
import { useEffect, useState } from 'react';

export function useStoreSearch(
  repository: StoreRepository,
  params: StoreSearchParams,
  selectedIds: string[],
  attempt: number,
) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [queryStatus, setQueryStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [selectionFailed, setSelectionFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setQueryStatus('loading');
    const timer = setTimeout(() => {
      void repository
        .searchStores(params)
        .then((result) => {
          if (cancelled) return;
          setStores(result);
          setQueryStatus('success');
        })
        .catch(() => {
          if (!cancelled) setQueryStatus('error');
        });
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [repository, params, attempt]);

  useEffect(() => {
    let cancelled = false;
    setSelectedStores([]);
    setSelectionFailed(false);
    void Promise.all(selectedIds.map((id) => repository.getStoreById(id)))
      .then((results) => {
        if (!cancelled)
          setSelectedStores(
            results.filter((store): store is Store => store !== null),
          );
      })
      .catch(() => {
        if (!cancelled) setSelectionFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, selectedIds, attempt]);

  return { stores, selectedStores, queryStatus, selectionFailed };
}
