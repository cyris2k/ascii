'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { Region, ShapeType } from '@/lib/regions';

const CHAR_W = 0.601; // ratio: charWidth = fontSize * CHAR_W
const CHAR_H = 1.2;   // ratio: charHeight = fontSize * CHAR_H
const PAD = 8;

interface Props {
  cols: number;
  numRows: number;
  fontSize: number;
  zoom: number;
  regions: Region[];
  activeShapeType: ShapeType;
  activeColor: string;
  drawingMode: boolean;
  onAddRegion: (r: Region) => void;
  onDeleteRegion: (id: string) => void;
}

type DrawState =
  | { phase: 'idle' }
  | { phase: 'rect' | 'circle'; startCol: number; startRow: number; curCol: number; curRow: number }
  | { phase: 'polygon'; points: { col: number; row: number }[]; curCol: number; curRow: number };

export default function RegionOverlay({
  cols, numRows, fontSize, zoom, regions,
  activeShapeType, activeColor, drawingMode,
  onAddRegion, onDeleteRegion,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draw, setDraw] = useState<DrawState>({ phase: 'idle' });

  const charW = fontSize * CHAR_W;
  const charH = fontSize * CHAR_H;
  const svgW = cols * charW + PAD * 2;
  const svgH = numRows * charH + PAD * 2;

  // Reset draw state when exiting drawing mode
  useEffect(() => {
    if (!drawingMode) setDraw({ phase: 'idle' });
  }, [drawingMode]);

  const getLocalPos = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  const toChar = useCallback((x: number, y: number) => ({
    col: Math.max(0, Math.min(cols - 1, Math.floor((x - PAD) / charW))),
    row: Math.max(0, Math.min(numRows - 1, Math.floor((y - PAD) / charH))),
  }), [cols, numRows, charW, charH]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!drawingMode || e.button !== 0) return;
    e.preventDefault();
    const { x, y } = getLocalPos(e);
    const { col, row } = toChar(x, y);

    if (activeShapeType === 'polygon') {
      setDraw(d =>
        d.phase === 'polygon'
          ? { ...d, points: [...d.points, { col, row }] }
          : { phase: 'polygon', points: [{ col, row }], curCol: col, curRow: row }
      );
    } else {
      setDraw({ phase: activeShapeType, startCol: col, startRow: row, curCol: col, curRow: row });
    }
  }, [drawingMode, activeShapeType, getLocalPos, toChar]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drawingMode || draw.phase === 'idle') return;
    const { x, y } = getLocalPos(e);
    const { col, row } = toChar(x, y);
    setDraw(d => d.phase !== 'idle' ? { ...d, curCol: col, curRow: row } : d);
  }, [drawingMode, draw.phase, getLocalPos, toChar]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drawingMode || draw.phase === 'idle' || draw.phase === 'polygon') return;
    const { x, y } = getLocalPos(e);
    const { col, row } = toChar(x, y);
    const id = crypto.randomUUID();

    if (draw.phase === 'rect') {
      onAddRegion({
        id, type: 'rect', color: activeColor,
        colStart: Math.min(draw.startCol, col),
        rowStart: Math.min(draw.startRow, row),
        colEnd: Math.max(draw.startCol, col),
        rowEnd: Math.max(draw.startRow, row),
      });
    } else if (draw.phase === 'circle') {
      const r = Math.max(1,
        Math.max(Math.abs(col - draw.startCol), Math.abs(row - draw.startRow))
      );
      onAddRegion({
        id, type: 'circle', color: activeColor,
        centerCol: draw.startCol, centerRow: draw.startRow,
        radiusCols: r, radiusRows: r,
      });
    }
    setDraw({ phase: 'idle' });
  }, [drawingMode, draw, getLocalPos, toChar, activeColor, onAddRegion]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!drawingMode || draw.phase !== 'polygon') return;
    e.preventDefault();
    if (draw.points.length < 3) return;
    onAddRegion({ id: crypto.randomUUID(), type: 'polygon', color: activeColor, points: draw.points });
    setDraw({ phase: 'idle' });
  }, [drawingMode, draw, activeColor, onAddRegion]);

  // Keyboard shortcuts for polygon
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDraw({ phase: 'idle' });
      if (e.key === 'Enter' && draw.phase === 'polygon' && draw.points.length >= 3) {
        onAddRegion({ id: crypto.randomUUID(), type: 'polygon', color: activeColor, points: draw.points });
        setDraw({ phase: 'idle' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draw, activeColor, onAddRegion]);

  // SVG pixel position of char center
  const cx = (col: number) => col * charW + PAD + charW / 2;
  const cy = (row: number) => row * charH + PAD + charH / 2;

  // Placed regions have no visual — only the colored text in the ASCII output shows them
  const renderRegion = (_region: Region) => null;

  const renderPreview = () => {
    if (draw.phase === 'idle') return null;
    const { curCol, curRow } = draw as { curCol: number; curRow: number };
    const previewStyle = { fill: activeColor, fillOpacity: 0.12, stroke: activeColor, strokeOpacity: 0.9, strokeWidth: 1.5, strokeDasharray: '6 2' };

    if (draw.phase === 'rect') {
      const c0 = Math.min(draw.startCol, curCol);
      const r0 = Math.min(draw.startRow, curRow);
      const c1 = Math.max(draw.startCol, curCol);
      const r1 = Math.max(draw.startRow, curRow);
      return (
        <rect
          x={c0 * charW + PAD} y={r0 * charH + PAD}
          width={(c1 - c0 + 1) * charW} height={(r1 - r0 + 1) * charH}
          {...previewStyle}
        />
      );
    }
    if (draw.phase === 'circle') {
      const r = Math.max(1, Math.max(Math.abs(curCol - draw.startCol), Math.abs(curRow - draw.startRow)));
      return (
        <ellipse
          cx={cx(draw.startCol)} cy={cy(draw.startRow)}
          rx={r * charW} ry={r * charH}
          {...previewStyle}
        />
      );
    }
    if (draw.phase === 'polygon') {
      const allPts = [...draw.points, { col: curCol, row: curRow }];
      const pts = allPts.map(p => `${cx(p.col)},${cy(p.row)}`).join(' ');
      return (
        <>
          <polyline points={pts} fill="none" stroke={activeColor} strokeOpacity={0.9} strokeWidth={1.5} strokeDasharray="6 2" />
          {draw.points.map((p, i) => (
            <circle key={i} cx={cx(p.col)} cy={cy(p.row)} r={3} fill={activeColor} fillOpacity={0.9} />
          ))}
          {/* Close hint: highlight first point */}
          {draw.points.length > 0 && (
            <circle cx={cx(draw.points[0].col)} cy={cy(draw.points[0].row)} r={5} fill="none" stroke={activeColor} strokeWidth={1.5} strokeOpacity={0.6} />
          )}
        </>
      );
    }
    return null;
  };

  return (
    <svg
      ref={svgRef}
      width={svgW}
      height={svgH}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: drawingMode ? 'all' : 'none',
        cursor: drawingMode ? 'crosshair' : 'default',
        userSelect: 'none',
        overflow: 'visible',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {regions.map(renderRegion)}
      {renderPreview()}
    </svg>
  );
}
