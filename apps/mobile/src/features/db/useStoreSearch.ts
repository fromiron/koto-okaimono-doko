import type { Store, StoreRepository, StoreSearchParams } from '@koto/schema';
import { useEffect, useState } from 'react';

type QueryStatus = 'loading' | 'success' | 'error';
type QueryResult = {
  key: string;
  repository: StoreRepository;
  stores: Store[];
  status: QueryStatus;
};

export function useStoreSearch(
  repository: StoreRepository,
  params: StoreSearchParams,
  selectedIds: string[],
  attempt: number,
  datasetRevision?: string,
) {
  const queryKey = JSON.stringify([params, datasetRevision]);
  const selectionKey = JSON.stringify([selectedIds, datasetRevision, attempt]);
  const [query, setQuery] = useState<QueryResult | null>(null);
  const [selection, setSelection] = useState<QueryResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQuery((previous) => ({
      key: queryKey,
      repository,
      stores:
        previous?.key === queryKey && previous.repository === repository
          ? previous.stores
          : [],
      status: 'loading',
    }));
    const timer = setTimeout(() => {
      void repository
        .searchStores(params)
        .then((stores) => {
          if (!cancelled)
            setQuery({ key: queryKey, repository, stores, status: 'success' });
        })
        .catch(() => {
          if (!cancelled)
            setQuery((previous) =>
              previous ? { ...previous, status: 'error' } : null,
            );
        });
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [repository, params, queryKey, attempt]);

  useEffect(() => {
    let cancelled = false;
    setSelection({
      key: selectionKey,
      repository,
      stores: [],
      status: 'loading',
    });
    void Promise.all(selectedIds.map((id) => repository.getStoreById(id)))
      .then((results) => {
        if (!cancelled)
          setSelection({
            key: selectionKey,
            repository,
            stores: results.filter((store): store is Store => store !== null),
            status: 'success',
          });
      })
      .catch(() => {
        if (!cancelled)
          setSelection({
            key: selectionKey,
            repository,
            stores: [],
            status: 'error',
          });
      });
    return () => {
      cancelled = true;
    };
  }, [repository, selectedIds, selectionKey]);

  const currentQuery =
    query?.key === queryKey && query.repository === repository ? query : null;
  const currentSelection =
    selection?.key === selectionKey && selection.repository === repository
      ? selection
      : null;
  return {
    stores: currentQuery?.stores ?? [],
    selectedStores: currentSelection?.stores ?? [],
    queryStatus: currentQuery?.status ?? 'loading',
    selectionStatus: currentSelection?.status ?? 'loading',
    selectionFailed: currentSelection?.status === 'error',
  };
}
