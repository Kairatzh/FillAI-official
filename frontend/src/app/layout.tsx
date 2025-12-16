import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Living Graph UI',
  description: 'A futuristic, living graph interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

