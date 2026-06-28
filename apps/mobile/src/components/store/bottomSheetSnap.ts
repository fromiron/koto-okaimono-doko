/** Snap indices for the store bottom sheet (gorhom snapPoints order). */
export const COLLAPSED_SNAP_INDEX = 0;
export const EXPANDED_SNAP_INDEX = 1;

/** The sheet expands when a store (or location group) is selected, otherwise it peeks. */
export function sheetSnapIndex(hasSelection: boolean): number {
  return hasSelection ? EXPANDED_SNAP_INDEX : COLLAPSED_SNAP_INDEX;
}
