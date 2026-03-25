export type ShapeType = 'rect' | 'circle' | 'polygon';

export interface RectRegion {
  id: string; type: 'rect'; color: string;
  colStart: number; rowStart: number; colEnd: number; rowEnd: number;
}
export interface CircleRegion {
  id: string; type: 'circle'; color: string;
  centerCol: number; centerRow: number;
  radiusCols: number; radiusRows: number;
}
export interface PolygonRegion {
  id: string; type: 'polygon'; color: string;
  points: { col: number; row: number }[];
}
export type Region = RectRegion | CircleRegion | PolygonRegion;

export function hitTest(col: number, row: number, region: Region): boolean {
  if (region.type === 'rect') {
    return col >= Math.min(region.colStart, region.colEnd) &&
           col <= Math.max(region.colStart, region.colEnd) &&
           row >= Math.min(region.rowStart, region.rowEnd) &&
           row <= Math.max(region.rowStart, region.rowEnd);
  }
  if (region.type === 'circle') {
    const rx = Math.max(region.radiusCols, 0.5);
    const ry = Math.max(region.radiusRows, 0.5);
    return ((col - region.centerCol) / rx) ** 2 + ((row - region.centerRow) / ry) ** 2 <= 1;
  }
  if (region.type === 'polygon') {
    const { points } = region;
    if (points.length < 3) return false;
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const { col: xi, row: yi } = points[i];
      const { col: xj, row: yj } = points[j];
      if ((yi > row) !== (yj > row) && col < (xj - xi) * (row - yi) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  }
  return false;
}
