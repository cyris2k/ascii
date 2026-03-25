import type { AsciiResult } from './converter';

interface ExportOptions {
  result: AsciiResult;
  fontSize?: number;
  fg?: string;
  bg?: string;
}

export function exportSVG({ result, fontSize = 10, fg = '#e5e5e5', bg = '#0a0a0a' }: ExportOptions): void {
  const { rows, cols } = result;
  const charW = fontSize * 0.601; // Courier New char width ratio
  const charH = fontSize * 1.2;
  const padX = charW;
  const padY = charH;

  const svgW = Math.ceil(cols * charW + padX * 2);
  const svgH = Math.ceil(rows.length * charH + padY * 2);

  const tspans = rows
    .map((row, i) => {
      const escaped = row
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/ /g, '\u00A0'); // preserve spaces
      return `  <tspan x="${padX}" dy="${i === 0 ? 0 : charH}">${escaped}</tspan>`;
    })
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text
    font-family="'Courier New', Courier, monospace"
    font-size="${fontSize}"
    fill="${fg}"
    x="${padX}"
    y="${padY + fontSize}"
    xml:space="preserve"
  >
${tspans}
  </text>
</svg>`;

  download(new Blob([svg], { type: 'image/svg+xml' }), 'ascii-art.svg');
}

export function exportPNG({ result, fontSize = 10, fg = '#e5e5e5', bg = '#0a0a0a' }: ExportOptions): void {
  const { rows, cols } = result;
  const scale = 2; // retina
  const charW = fontSize * 0.601;
  const charH = fontSize * 1.2;
  const padX = charW;
  const padY = charH;

  const canvasW = Math.ceil(cols * charW + padX * 2);
  const canvasH = Math.ceil(rows.length * charH + padY * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW * scale;
  canvas.height = canvasH * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.font = `${fontSize}px 'Courier New', Courier, monospace`;
  ctx.fillStyle = fg;
  ctx.textBaseline = 'top';

  rows.forEach((row, i) => {
    ctx.fillText(row, padX, padY + i * charH);
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
