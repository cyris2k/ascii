'use client';

import { useRef, useState } from 'react';
import type { AsciiResult } from '@/lib/converter';

interface Props {
  result: AsciiResult | null;
  fontSize: number;
  fgColor: string;
  bgColor: string;
}

export default function Preview({ result, fontSize, fgColor, bgColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FFFA]">
        <p className="text-[#9ca3af] font-mono text-sm">processing…</p>
      </div>
    );
  }

  const lineH = fontSize * 1.2;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#F8FFFA]/90 border-b border-[#d1e8d8] backdrop-blur">
        <span className="text-[#6b7280] font-mono text-xs">
          {result.cols} × {result.numRows} chars
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.2, +(z - 0.2).toFixed(1)))}
            className="w-7 h-7 rounded bg-white border border-[#c8d9cc] hover:bg-[#e6f2ea] text-[#1a1a1a] font-mono text-sm flex items-center justify-center transition-colors"
          >−</button>
          <span className="text-[#6b7280] font-mono text-xs w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(4, +(z + 0.2).toFixed(1)))}
            className="w-7 h-7 rounded bg-white border border-[#c8d9cc] hover:bg-[#e6f2ea] text-[#1a1a1a] font-mono text-sm flex items-center justify-center transition-colors"
          >+</button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 h-7 rounded bg-white border border-[#c8d9cc] hover:bg-[#e6f2ea] text-[#6b7280] font-mono text-xs transition-colors"
          >fit</button>
        </div>
      </div>

      {/* ASCII output */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6"
        style={{ backgroundColor: bgColor }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            display: 'inline-block',
          }}
        >
          <pre
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: `${fontSize}px`,
              lineHeight: `${lineH}px`,
              color: fgColor,
              backgroundColor: bgColor,
              margin: 0,
              padding: '8px',
              whiteSpace: 'pre',
              letterSpacing: '0px',
            }}
          >
            {result.rows.join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}
