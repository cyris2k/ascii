'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

interface Props {
  onImage: (img: HTMLImageElement) => void;
}

export default function Uploader({ onImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const load = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { onImage(img); URL.revokeObjectURL(url); };
    img.src = url;
  }, [onImage]);

  const loadUrl = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => onImage(img);
    img.src = src;
  }, [onImage]);

  // Global paste handler
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imgItem = items.find(i => i.type.startsWith('image/'));
      if (imgItem) {
        const file = imgItem.getAsFile();
        if (file) load(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [load]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { load(file); return; }
    // URL drop
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url) loadUrl(url);
  }, [load, loadUrl]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-mono font-bold text-white tracking-tight mb-2">
          <span className="text-[#39ff14]">ASCII</span> TOOL
        </h1>
        <p className="text-zinc-500 font-mono text-sm tracking-widest">
          IMAGE → CHARACTER ART
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`
          relative w-full max-w-2xl aspect-video rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center cursor-pointer select-none
          transition-all duration-200
          ${dragging
            ? 'border-[#39ff14] bg-[#39ff14]/5 scale-[1.02]'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/40'
          }
        `}
      >
        <div className="text-6xl mb-4 font-mono text-zinc-600">
          {dragging ? '⬇' : '⬆'}
        </div>
        <p className="text-white font-mono text-lg font-semibold mb-1">
          Drop image here
        </p>
        <p className="text-zinc-500 font-mono text-sm">
          or click to browse · paste with ⌘V
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) load(f); }}
        />
      </div>

      {/* Supported formats */}
      <p className="mt-6 text-zinc-600 font-mono text-xs tracking-wider">
        PNG · JPG · WEBP · GIF · SVG · BMP
      </p>

      {/* Preview char modes */}
      <div className="mt-12 flex gap-6 text-zinc-700 font-mono text-xs">
        {['@#$%&', '101010', '987654', '{}[]<>', 'Lorem ipsum'].map((s, i) => (
          <span key={i} className="opacity-50 hover:opacity-100 transition-opacity">{s}</span>
        ))}
      </div>
    </div>
  );
}
