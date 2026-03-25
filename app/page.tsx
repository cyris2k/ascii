'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Uploader from '@/components/Uploader';
import Preview from '@/components/Preview';
import Controls from '@/components/Controls';
import { convertToAscii, CharsetMode, AsciiResult, DEFAULT_TEXT, ImageAdjustments, DEFAULT_ADJUSTMENTS } from '@/lib/converter';
import type { Region, ShapeType } from '@/lib/regions';

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<AsciiResult | null>(null);

  // Base layer
  const [mode, setMode] = useState<CharsetMode>('code');
  const [cols, setCols] = useState(100);
  const [invert, setInvert] = useState(false);
  const [customText, setCustomText] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(10);
  const [baseFgColor, setBaseFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#F8FFFA');

  // Image adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);

  // Regions
  const [regions, setRegions] = useState<Region[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeShapeType, setActiveShapeType] = useState<ShapeType>('rect');
  const [activeRegionColor, setActiveRegionColor] = useState('#3b82f6');

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
    const ascii = convertToAscii(imageData, { mode, cols, invert, customText, regions, baseFgColor, adjustments });
    setResult(ascii);
  }, [image, mode, cols, invert, customText, regions, baseFgColor, adjustments]);

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
    setRegions([]);
    setDrawingMode(false);
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, []);

  const addRegion = useCallback((r: Region) => setRegions(prev => [...prev, r]), []);
  const deleteRegion = useCallback((id: string) => setRegions(prev => prev.filter(r => r.id !== id)), []);

  return (
    <main className="h-screen flex overflow-hidden bg-[#F8FFFA]">
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
            bgColor={bgColor} setBgColor={setBgColor}
            baseFgColor={baseFgColor} setBaseFgColor={setBaseFgColor}
            regions={regions} onDeleteRegion={deleteRegion}
            drawingMode={drawingMode} setDrawingMode={setDrawingMode}
            activeShapeType={activeShapeType} setActiveShapeType={setActiveShapeType}
            activeRegionColor={activeRegionColor} setActiveRegionColor={setActiveRegionColor}
            adjustments={adjustments} setAdjustments={setAdjustments}
          />
          <Preview
            result={result}
            fontSize={fontSize}
            bgColor={bgColor}
            regions={regions}
            activeShapeType={activeShapeType}
            activeRegionColor={activeRegionColor}
            drawingMode={drawingMode}
            onAddRegion={addRegion}
            onDeleteRegion={deleteRegion}
          />
        </>
      )}
    </main>
  );
}
