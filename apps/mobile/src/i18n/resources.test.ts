import { supportedLocales } from '@koto/schema';
import { describe, expect, it } from 'vitest';

import { resources } from './resources';

describe('i18n resources', () => {
  it('defines every supported locale', () => {
    expect(Object.keys(resources).sort()).toEqual([...supportedLocales].sort());
  });

  it('defines translated top-level categories for every locale', () => {
    for (const locale of supportedLocales) {
      const categories = resources[locale].translation.categories as {
        major: Record<string, string>;
      };

      expect(categories.major.eat_drink).toBeTruthy();
      expect(categories.major.shopping).toBeTruthy();
      expect(categories.major.life_home).toBeTruthy();
    }
  });
});
