import type { AsciiResult, ColorRun } from './converter';

interface ExportOptions {
  result: AsciiResult;
  fontSize?: number;
  bg?: string;
}

const CHAR_W_RATIO = 0.601;
const LINE_H_RATIO = 1.2;
const PAD = 8;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/ /g, '\u00A0');
}

export function exportSVG({ result, fontSize = 10, bg = '#0a0a0a' }: ExportOptions): void {
  const { rows, cols } = result;
  const charW = fontSize * CHAR_W_RATIO;
  const lineH = fontSize * LINE_H_RATIO;
  const svgW = Math.ceil(cols * charW + PAD * 2);
  const svgH = Math.ceil(rows.length * lineH + PAD * 2);

  const textLines = rows.map((row: ColorRun[], i: number) => {
    const y = PAD + (i + 1) * lineH;
    let xOffset = 0;
    const spans = row.map((run: ColorRun) => {
      const x = PAD + xOffset * charW;
      xOffset += run.text.length;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="'Courier New',Courier,monospace" font-size="${fontSize}" fill="${run.color}" xml:space="preserve">${escapeXml(run.text)}</text>`;
    });
    return spans.join('\n');
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="100%" height="100%" fill="${bg}"/>
${textLines}
</svg>`;

  download(new Blob([svg], { type: 'image/svg+xml' }), 'ascii-art.svg');
}

export function exportPNG({ result, fontSize = 10, bg = '#0a0a0a' }: ExportOptions): void {
  const { rows, cols } = result;
  const scale = 2;
  const charW = fontSize * CHAR_W_RATIO;
  const lineH = fontSize * LINE_H_RATIO;
  const canvasW = Math.ceil(cols * charW + PAD * 2);
  const canvasH = Math.ceil(rows.length * lineH + PAD * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW * scale;
  canvas.height = canvasH * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.font = `${fontSize}px 'Courier New', Courier, monospace`;
  ctx.textBaseline = 'top';

  rows.forEach((row: ColorRun[], i: number) => {
    let xOffset = 0;
    row.forEach((run: ColorRun) => {
      ctx.fillStyle = run.color;
      ctx.fillText(run.text, PAD + xOffset * charW, PAD + i * lineH);
      xOffset += run.text.length;
    });
  });

  canvas.toBlob((blob) => {
    if (blob) download(blob, 'ascii-art.png');
  }, 'image/png');
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
