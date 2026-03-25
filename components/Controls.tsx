'use client';

import type { CharsetMode, AsciiResult } from '@/lib/converter';
import { DEFAULT_TEXT } from '@/lib/converter';
import type { Region, ShapeType } from '@/lib/regions';
import { exportSVG, exportPNG } from '@/lib/exporter';

const CHARSETS: { id: CharsetMode; label: string; preview: string }[] = [
  { id: 'ascii',   label: 'ASCII',   preview: '@#%*+:.' },
  { id: 'binary',  label: 'Binary',  preview: '10110101' },
  { id: 'numbers', label: 'Numbers', preview: '98765432' },
  { id: 'code',    label: 'Code',    preview: '{}[]<>()' },
  { id: 'text',    label: 'Text',    preview: 'paragraph' },
];

const SHAPES: { id: ShapeType; label: string; icon: string }[] = [
  { id: 'rect',    label: 'Rect',    icon: '▭' },
  { id: 'circle',  label: 'Circle',  icon: '◯' },
  { id: 'polygon', label: 'Polygon', icon: '⬡' },
];

const REGION_COLOR_PRESETS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#ffffff', '#166534'];

interface Props {
  mode: CharsetMode;
  setMode: (m: CharsetMode) => void;
  cols: number;
  setCols: (n: number) => void;
  invert: boolean;
  setInvert: (v: boolean) => void;
  customText: string;
  setCustomText: (t: string) => void;
  onReset: () => void;
  result: AsciiResult | null;
  fontSize: number;
  setFontSize: (n: number) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  baseFgColor: string;
  setBaseFgColor: (c: string) => void;
  // Regions
  regions: Region[];
  onDeleteRegion: (id: string) => void;
  drawingMode: boolean;
  setDrawingMode: (v: boolean) => void;
  activeShapeType: ShapeType;
  setActiveShapeType: (s: ShapeType) => void;
  activeRegionColor: string;
  setActiveRegionColor: (c: string) => void;
}

export default function Controls({
  mode, setMode, cols, setCols, invert, setInvert,
  customText, setCustomText, onReset, result,
  fontSize, setFontSize, bgColor, setBgColor,
  baseFgColor, setBaseFgColor,
  regions, onDeleteRegion,
  drawingMode, setDrawingMode, activeShapeType, setActiveShapeType,
  activeRegionColor, setActiveRegionColor,
}: Props) {
  return (
    <aside className="w-72 shrink-0 bg-[#F8FFFA] border-r border-[#d1e8d8] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-[#d1e8d8] flex items-center justify-between">
        <span className="font-mono font-bold text-lg text-[#1a1a1a]">
          <span className="text-[#166534]">ASCII</span> TOOL
        </span>
        <button
          onClick={onReset}
          className="text-[#6b7280] hover:text-[#1a1a1a] font-mono text-xs transition-colors px-2 py-1 rounded hover:bg-[#e6f2ea]"
        >
          ← new
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6">

        {/* Base Character Set */}
        <section>
          <label className="block text-[#6b7280] font-mono text-xs tracking-widest uppercase mb-3">
            Base Layer
          </label>
          <div className="space-y-1.5">
            {CHARSETS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-sm
                  transition-all duration-150
                  ${mode === m.id
                    ? 'bg-[#166534]/10 border border-[#166534]/30 text-[#166534]'
                    : 'border border-transparent text-[#374151] hover:text-[#1a1a1a] hover:bg-[#e6f2ea]'
                  }
                `}
              >
                <span className="font-semibold">{m.label}</span>
                <span className="text-[10px] opacity-60 tracking-wider">{m.preview}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Paragraph Text */}
        <section>
          <label className="block text-[#6b7280] font-mono text-xs tracking-widest uppercase mb-3">
            Paragraph Text
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={DEFAULT_TEXT}
            rows={4}
            className="w-full bg-white border border-[#c8d9cc] rounded-lg p-3 font-mono text-xs text-[#1a1a1a] resize-none focus:outline-none focus:border-[#166534]/50 placeholder:text-[#9ca3af]"
          />
          <button
            onClick={() => setCustomText(DEFAULT_TEXT)}
            className="mt-1.5 text-[#6b7280] hover:text-[#166534] font-mono text-xs transition-colors"
          >
            reset to default
          </button>
          <p className="mt-1 text-[#9ca3af] font-mono text-[10px]">
            Used for Text base layer and all regions
          </p>
        </section>

        {/* Regions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[#6b7280] font-mono text-xs tracking-widest uppercase">
              Regions
            </label>
            <button
              onClick={() => setDrawingMode(!drawingMode)}
              className={`
                px-3 py-1 rounded font-mono text-xs font-semibold transition-all
                ${drawingMode
                  ? 'bg-[#166534] text-white'
                  : 'bg-[#166534]/10 border border-[#166534]/30 text-[#166534] hover:bg-[#166534]/20'
                }
              `}
            >
              {drawingMode ? '✕ done' : '+ draw'}
            </button>
          </div>

          {/* Shape type + color (shown in draw mode) */}
          {drawingMode && (
            <div className="mb-3 space-y-2">
              <div className="flex gap-1.5">
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveShapeType(s.id)}
                    title={s.label}
                    className={`
                      flex-1 py-2 rounded-lg font-mono text-sm transition-all
                      ${activeShapeType === s.id
                        ? 'bg-[#166534]/15 border border-[#166534]/40 text-[#166534]'
                        : 'bg-white border border-[#c8d9cc] text-[#374151] hover:bg-[#e6f2ea]'
                      }
                    `}
                  >
                    <span className="block text-center">{s.icon}</span>
                    <span className="block text-center text-[10px] mt-0.5">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Region color */}
              <div>
                <p className="text-[#9ca3af] font-mono text-[10px] mb-1.5">Region text color</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {REGION_COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveRegionColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        activeRegionColor === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={activeRegionColor}
                    onChange={(e) => setActiveRegionColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 p-0"
                    title="Custom color"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Region list */}
          {regions.length === 0 ? (
            <p className="text-[#9ca3af] font-mono text-xs text-center py-3">
              {drawingMode ? 'Draw a shape on the canvas →' : 'No regions yet'}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {regions.map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-[#d1e8d8]">
                  <div className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10" style={{ backgroundColor: r.color }} />
                  <span className="flex-1 font-mono text-xs text-[#374151]">
                    Region {i + 1} · {r.type}
                  </span>
                  <button
                    onClick={() => onDeleteRegion(r.id)}
                    className="text-[#9ca3af] hover:text-red-500 font-mono text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Resolution */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[#6b7280] font-mono text-xs tracking-widest uppercase">
              Resolution
            </label>
            <span className="text-[#1a1a1a] font-mono text-xs">{cols} cols</span>
          </div>
          <input
            type="range" min={30} max={220} step={5}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-full accent-[#166534]"
          />
          <div className="flex justify-between text-[#9ca3af] font-mono text-[10px] mt-1">
            <span>low</span><span>high</span>
          </div>
        </section>

        {/* Font size */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[#6b7280] font-mono text-xs tracking-widest uppercase">
              Font Size
            </label>
            <span className="text-[#1a1a1a] font-mono text-xs">{fontSize}px</span>
          </div>
          <input
            type="range" min={4} max={20} step={1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[#166534]"
          />
        </section>

        {/* Colors */}
        <section>
          <label className="block text-[#6b7280] font-mono text-xs tracking-widest uppercase mb-3">
            Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input type="color" value={baseFgColor} onChange={(e) => setBaseFgColor(e.target.value)}
                className="h-8 w-12 rounded cursor-pointer bg-transparent border-0" />
              <span className="text-[#6b7280] font-mono text-xs">Base text</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-12 rounded cursor-pointer bg-transparent border-0" />
              <span className="text-[#6b7280] font-mono text-xs">Background</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { fg: '#1a1a1a', bg: '#F8FFFA', label: 'Default' },
              { fg: '#e5e5e5', bg: '#0a0a0a', label: 'Dark' },
              { fg: '#166534', bg: '#F8FFFA', label: 'Green' },
              { fg: '#00bfff', bg: '#0a0a0a', label: 'Cyan' },
              { fg: '#ff6b35', bg: '#0a0a0a', label: 'Amber' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setBaseFgColor(preset.fg); setBgColor(preset.bg); }}
                className="px-2 py-1 rounded font-mono text-[10px] border border-[#c8d9cc] hover:border-[#166534]/50 transition-colors"
                style={{ color: preset.fg, backgroundColor: preset.bg }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        {/* Invert */}
        <section>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setInvert(!invert)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${invert ? 'bg-[#166534]/80' : 'bg-[#c8d9cc]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${invert ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[#6b7280] group-hover:text-[#1a1a1a] font-mono text-sm transition-colors">
              Invert colors
            </span>
          </label>
        </section>

      </div>

      {/* Export */}
      {result && (
        <div className="p-5 border-t border-[#d1e8d8] space-y-2">
          <label className="block text-[#6b7280] font-mono text-xs tracking-widest uppercase mb-3">
            Export
          </label>
          <button
            onClick={() => exportSVG({ result, fontSize, bg: bgColor })}
            className="w-full py-2.5 rounded-lg font-mono text-sm font-semibold bg-[#166534]/10 border border-[#166534]/30 text-[#166534] hover:bg-[#166534]/20 transition-colors"
          >
            Download SVG
          </button>
          <button
            onClick={() => exportPNG({ result, fontSize, bg: bgColor })}
            className="w-full py-2.5 rounded-lg font-mono text-sm font-semibold bg-white border border-[#c8d9cc] text-[#1a1a1a] hover:bg-[#e6f2ea] transition-colors"
          >
            Download PNG
          </button>
        </div>
      )}
    </aside>
  );
}
