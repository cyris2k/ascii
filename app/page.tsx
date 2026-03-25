'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Uploader from '@/components/Uploader';
import Preview from '@/components/Preview';
import Controls from '@/components/Controls';
import { convertToAscii, CharsetMode, AsciiResult, DEFAULT_TEXT } from '@/lib/converter';

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<AsciiResult | null>(null);
  const [mode, setMode] = useState<CharsetMode>('ascii');
  const [cols, setCols] = useState(100);
  const [invert, setInvert] = useState(false);
  const [customText, setCustomText] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(10);
  const [fgColor, setFgColor] = useState('#e5e5e5');
  const [bgColor, setBgColor] = useState('#0a0a0a');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const process = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const ascii = convertToAscii(imageData, { mode, cols, invert, customText });
    setResult(ascii);
  }, [image, mode, cols, invert, customText]);

  useEffect(() => {
    if (image) process();
  }, [process, image]);

  const handleImage = useCallback((img: HTMLImageElement) => {
    setResult(null);
    setImage(img);
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setResult(null);
  }, []);

  return (
    <main className="h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Hidden canvas for pixel extraction */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {!image ? (
        <Uploader onImage={handleImage} />
      ) : (
        <>
          <Controls
            mode={mode} setMode={setMode}
            cols={cols} setCols={setCols}
            invert={invert} setInvert={setInvert}
            customText={customText} setCustomText={setCustomText}
            onReset={handleReset}
            result={result}
            fontSize={fontSize} setFontSize={setFontSize}
            fgColor={fgColor} setFgColor={setFgColor}
            bgColor={bgColor} setBgColor={setBgColor}
          />
          <Preview
            result={result}
            fontSize={fontSize}
            fgColor={fgColor}
            bgColor={bgColor}
          />
        </>
      )}
    </main>
  );
}
