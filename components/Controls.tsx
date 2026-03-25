'use client';

import type { CharsetMode, AsciiResult } from '@/lib/converter';
import { DEFAULT_TEXT } from '@/lib/converter';
import { exportSVG, exportPNG } from '@/lib/exporter';

const MODES: { id: CharsetMode; label: string; preview: string }[] = [
  { id: 'ascii',   label: 'ASCII',   preview: '@#%*+:.' },
  { id: 'binary',  label: 'Binary',  preview: '10110101' },
  { id: 'numbers', label: 'Numbers', preview: '98765432' },
  { id: 'code',    label: 'Code',    preview: '{}[]<>()' },
  { id: 'text',    label: 'Text',    preview: 'paragraph' },
];

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
  fgColor: string;
  setFgColor: (c: string) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
}

export default function Controls({
  mode, setMode, cols, setCols, invert, setInvert,
  customText, setCustomText, onReset, result,
  fontSize, setFontSize, fgColor, setFgColor, bgColor, setBgColor,
}: Props) {
  return (
    <aside className="w-72 shrink-0 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <span className="font-mono font-bold text-lg text-white">
          <span className="text-[#39ff14]">ASCII</span> TOOL
        </span>
        <button
          onClick={onReset}
          className="text-zinc-500 hover:text-white font-mono text-xs transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          ← new
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* Character Set */}
        <section>
          <label className="block text-zinc-400 font-mono text-xs tracking-widest uppercase mb-3">
            Character Set
          </label>
          <div className="space-y-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-sm
                  transition-all duration-150
                  ${mode === m.id
                    ? 'bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14]'
                    : 'border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }
                `}
              >
                <span className="font-semibold">{m.label}</span>
                <span className="text-[10px] opacity-60 tracking-wider">{m.preview}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Custom text (only for text mode) */}
        {mode === 'text' && (
          <section>
            <label className="block text-zinc-400 font-mono text-xs tracking-widest uppercase mb-3">
              Paragraph Text
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={DEFAULT_TEXT}
              rows={5}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-xs text-white resize-none focus:outline-none focus:border-[#39ff14]/50 placeholder:text-zinc-600"
            />
            <button
              onClick={() => setCustomText(DEFAULT_TEXT)}
              className="mt-1.5 text-zinc-500 hover:text-zinc-300 font-mono text-xs transition-colors"
            >
              reset to default
            </button>
          </section>
        )}

        {/* Resolution */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
              Resolution
            </label>
            <span className="text-white font-mono text-xs">{cols} cols</span>
          </div>
          <input
            type="range" min={30} max={220} step={5}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-full accent-[#39ff14]"
          />
          <div className="flex justify-between text-zinc-600 font-mono text-[10px] mt-1">
            <span>low</span><span>high</span>
          </div>
        </section>

        {/* Font size */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
              Font Size
            </label>
            <span className="text-white font-mono text-xs">{fontSize}px</span>
          </div>
          <input
            type="range" min={4} max={20} step={1}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[#39ff14]"
          />
        </section>

        {/* Colors */}
        <section>
          <label className="block text-zinc-400 font-mono text-xs tracking-widest uppercase mb-3">
            Colors
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="color" value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-8 w-12 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-zinc-400 font-mono text-xs">Foreground</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color" value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-12 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-zinc-400 font-mono text-xs">Background</span>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { fg: '#e5e5e5', bg: '#0a0a0a', label: 'Dark' },
              { fg: '#0a0a0a', bg: '#f5f5f5', label: 'Light' },
              { fg: '#39ff14', bg: '#0a0a0a', label: 'Matrix' },
              { fg: '#00bfff', bg: '#0a0a0a', label: 'Cyan' },
              { fg: '#ff6b35', bg: '#0a0a0a', label: 'Amber' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                className="px-2 py-1 rounded font-mono text-[10px] border border-zinc-700 hover:border-zinc-500 transition-colors"
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
              className={`
                relative w-10 h-5 rounded-full transition-colors duration-200
                ${invert ? 'bg-[#39ff14]/80' : 'bg-zinc-700'}
              `}
            >
              <div className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                ${invert ? 'translate-x-5' : 'translate-x-0.5'}
              `} />
            </div>
            <span className="text-zinc-400 group-hover:text-white font-mono text-sm transition-colors">
              Invert colors
            </span>
          </label>
        </section>
      </div>

      {/* Export buttons */}
      {result && (
        <div className="p-5 border-t border-zinc-800 space-y-2">
          <label className="block text-zinc-400 font-mono text-xs tracking-widest uppercase mb-3">
            Export
          </label>
          <button
            onClick={() => exportSVG({ result, fontSize, fg: fgColor, bg: bgColor })}
            className="w-full py-2.5 rounded-lg font-mono text-sm font-semibold bg-[#39ff14]/10 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/20 transition-colors"
          >
            Download SVG
          </button>
          <button
            onClick={() => exportPNG({ result, fontSize, fg: fgColor, bg: bgColor })}
            className="w-full py-2.5 rounded-lg font-mono text-sm font-semibold bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors"
          >
            Download PNG
          </button>
        </div>
      )}
    </aside>
  );
}
