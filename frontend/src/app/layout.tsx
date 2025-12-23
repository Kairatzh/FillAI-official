'use client';

import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <title>Fill AI - Платформа для создания курсов с ИИ</title>
        <meta name="description" content="Создавайте и изучайте курсы с помощью искусственного интеллекта. Интерактивный граф знаний, ИИ-ментор и автоматическая генерация контента." />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

