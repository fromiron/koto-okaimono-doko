import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFilterStore } from '@/src/features/filters/filterStore';

import { useCurrentLocation } from './useCurrentLocation';

export function useCurrentLocationWithFeedback() {
  const { t } = useTranslation();
  const { requestCurrentLocation, status } = useCurrentLocation();

  const requestLocation = useCallback(async () => {
    const result = await requestCurrentLocation();

    if (result.status === 'denied') {
      useFilterStore.getState().setRadiusMeters('all');
      Alert.alert(
        t('map.locationPermissionTitle'),
        t('map.locationPermissionBody'),
        result.canAskAgain
          ? undefined
          : [
              { style: 'cancel', text: t('common.cancel') },
              {
                onPress: () => void Linking.openSettings(),
                text: t('map.openSettings'),
              },
            ],
      );
      return null;
    }

    if (result.status === 'failed') {
      useFilterStore.getState().setRadiusMeters('all');
      Alert.alert(
        t('map.locationFailedTitle'),
        t('map.locationFailedBody'),
      );
      return null;
    }

    return result.location;
  }, [requestCurrentLocation, t]);

  return { requestLocation, status };
}
