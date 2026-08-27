/** Visible height of the collapsed peek (excluding the bottom safe-area inset). */
export const SHEET_PEEK_HEIGHT = 208;
export const SHEET_MID_RATIO = 0.58;
export const SHEET_FULL_RATIO = 0.92;

export function getSheetHeightAtIndex(
  index: number,
  screenHeight: number,
  insetsBottom: number,
): number {
  if (index >= 2) return Math.round(screenHeight * SHEET_FULL_RATIO);
  if (index === 1) return Math.round(screenHeight * SHEET_MID_RATIO);
  return SHEET_PEEK_HEIGHT + insetsBottom;
}

export function getMapCameraLatitude(
  targetLatitude: number,
  latitudeDelta: number,
  screenHeight: number,
  topDeckHeight: number,
  sheetHeight: number,
): number {
  if (screenHeight <= 0) return targetLatitude;

  const hiddenHeight = Math.max(
    0,
    Math.min(sheetHeight, screenHeight) -
      Math.min(Math.max(topDeckHeight, 0), screenHeight),
  );
  return targetLatitude - (hiddenHeight / (2 * screenHeight)) * latitudeDelta;
}
