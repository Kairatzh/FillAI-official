import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fill AI - Платформа для создания курсов с ИИ',
  description: 'Создавайте и изучайте курсы с помощью искусственного интеллекта. Интерактивный граф знаний, ИИ-ментор и автоматическая генерация контента.',
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

