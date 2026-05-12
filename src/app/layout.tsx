import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learning Inventory',
  description: 'Gestión de inventario — práctica de bases de datos relacionales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
