import { useEffect, useState } from 'react';

/**
 * react-native-maps snapshots custom marker views on Android. Track for one
 * layout pass after the visual signature changes, then freeze — including
 * selected markers, which must not stay in perpetual tracksViewChanges.
 */
export function useMarkerBitmapCapture(signature: string): boolean {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const handle = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(handle);
  }, [signature]);

  return tracksViewChanges;
}
