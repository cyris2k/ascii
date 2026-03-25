import { hitTest, Region } from './regions';

export type CharsetMode = 'ascii' | 'binary' | 'numbers' | 'code' | 'text';

// Ordered dense → light
const CHARSETS: Record<Exclude<CharsetMode, 'text'>, string> = {
  ascii:   '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`. ',
  binary:  '10 ',
  numbers: '9876543210 ',
  code:    '}{][)(><+=*&^%$#@!~|/\\;:.,? ',
};

export const DEFAULT_TEXT =
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. ' +
  'How valiantly we fought against the rain and the wind—each element conspiring to break ' +
  'our resolve. Yet here we stand transformed by the journey made whole by the struggle. ' +
  'In the beginning was the word and the word was with light and the light became art. ' +
  'Every pixel tells a story every character carries weight every line holds meaning. ' +
  'We are the architects of vision building cathedrals from simple marks on a screen. ';

export interface ColorRun {
  text: string;
  color: string;
}

export interface AsciiResult {
  rows: ColorRun[][];
  cols: number;
  numRows: number;
}

export interface ConvertOptions {
  mode: CharsetMode;
  cols: number;
  invert: boolean;
  customText: string;
  regions: Region[];
  baseFgColor: string;
}

function getAvgBrightness(
  data: Uint8ClampedArray,
  x0: number, y0: number, x1: number, y1: number,
  width: number
): number {
  let sum = 0, count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      count++;
    }
  }
  return count > 0 ? sum / count / 255 : 0;
}

export function convertToAscii(imageData: ImageData, opts: ConvertOptions): AsciiResult {
  const { data, width, height } = imageData;
  const { mode, cols, invert, customText, regions, baseFgColor } = opts;

  const cellW = width / cols;
  const cellH = cellW * 2.0;
  const numRows = Math.floor(height / cellH);

  const chars = mode !== 'text' ? CHARSETS[mode] : null;
  const textSrc = (customText || DEFAULT_TEXT).replace(/\s+/g, ' ').trim();
  let baseTextIdx = 0;
  let regionTextIdx = 0;

  const rows: ColorRun[][] = [];

  for (let row = 0; row < numRows; row++) {
    const coloredRow: ColorRun[] = [];
    let currentRun: ColorRun | null = null;

    const y0 = Math.floor(row * cellH);
    const y1 = Math.min(Math.floor((row + 1) * cellH), height);

    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor((col / cols) * width);
      const x1 = Math.min(Math.floor(((col + 1) / cols) * width), width);

      let b = getAvgBrightness(data, x0, y0, x1, y1, width);
      if (invert) b = 1 - b;

      // Last region that contains this cell wins (top = last drawn)
      let regionColor: string | null = null;
      for (let ri = regions.length - 1; ri >= 0; ri--) {
        if (hitTest(col, row, regions[ri])) {
          regionColor = regions[ri].color;
          break;
        }
      }

      let char: string;
      let color: string;

      if (regionColor !== null) {
        // Paragraph text in region color
        char = b < 0.55 ? textSrc[regionTextIdx++ % textSrc.length] : ' ';
        color = regionColor;
      } else if (mode === 'text') {
        char = b < 0.55 ? textSrc[baseTextIdx++ % textSrc.length] : ' ';
        color = baseFgColor;
      } else {
        char = chars![Math.floor(b * (chars!.length - 1))];
        color = baseFgColor;
      }

      // Group consecutive same-color chars into runs
      if (currentRun && currentRun.color === color) {
        currentRun.text += char;
      } else {
        if (currentRun) coloredRow.push(currentRun);
        currentRun = { text: char, color };
      }
    }
    if (currentRun) coloredRow.push(currentRun);
    rows.push(coloredRow);
  }

  return { rows, cols, numRows };
}
