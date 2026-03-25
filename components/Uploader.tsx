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
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url) loadUrl(url);
  }, [load, loadUrl]);

  return (
    <div className="min-h-screen bg-[#F8FFFA] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-mono font-bold text-[#1a1a1a] tracking-tight mb-2">
          <span className="text-[#166534]">ASCII</span> TOOL
        </h1>
        <p className="text-[#6b7280] font-mono text-sm tracking-widest">
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
            ? 'border-[#166534] bg-[#166534]/5 scale-[1.02]'
            : 'border-[#c8d9cc] hover:border-[#166534]/50 bg-white/60'
          }
        `}
      >
        <div className="text-6xl mb-4 font-mono text-[#9ca3af]">
          {dragging ? '⬇' : '⬆'}
        </div>
        <p className="text-[#1a1a1a] font-mono text-lg font-semibold mb-1">
          Drop image here
        </p>
        <p className="text-[#6b7280] font-mono text-sm">
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
      <p className="mt-6 text-[#9ca3af] font-mono text-xs tracking-wider">
        PNG · JPG · WEBP · GIF · SVG · BMP
      </p>

      {/* Preview char modes */}
      <div className="mt-12 flex gap-6 text-[#9ca3af] font-mono text-xs">
        {['@#$%&', '101010', '987654', '{}[]<>', 'Lorem ipsum'].map((s, i) => (
          <span key={i} className="opacity-60 hover:opacity-100 transition-opacity">{s}</span>
        ))}
      </div>
    </div>
  );
}
