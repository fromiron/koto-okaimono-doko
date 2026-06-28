import { describe, expect, it } from 'vitest';

import { filterGroupsByRadius } from './filterByRadius';

const user = { latitude: 35.674, longitude: 139.81 };
const near = { id: 'near', lat: 35.674, lng: 139.81 }; // ~0 m
const far = { id: 'far', lat: 35.684, lng: 139.81 }; // ~1.1 km north
const groups = [near, far];

describe('filterGroupsByRadius', () => {
  it('returns all groups when radius is "all"', () => {
    expect(filterGroupsByRadius(groups, user, 'all')).toEqual(groups);
  });

  it('returns all groups when user location is unknown', () => {
    expect(filterGroupsByRadius(groups, null, 1000)).toEqual(groups);
  });

  it('keeps only groups within the radius', () => {
    expect(filterGroupsByRadius(groups, user, 1000)).toEqual([near]);
    expect(filterGroupsByRadius(groups, user, 2000)).toEqual([near, far]);
  });

  it('includes a group sitting at the user location for any radius', () => {
    expect(filterGroupsByRadius([near], user, 300)).toEqual([near]);
  });
});
