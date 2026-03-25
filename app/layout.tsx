import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ASCII Tool — Image to ASCII Art',
  description: 'Convert any image to ASCII art. Multiple character sets, SVG and PNG export.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
