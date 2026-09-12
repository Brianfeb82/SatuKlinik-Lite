import './globals.css';
import { ServiceWorkerRegistration } from './sw-register';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export const metadata = { 
  title: 'SatuKlinik Lite — Smart EMR', 
  description: 'Offline-First Smart EMR + Auto-ICD SATUSEHAT',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SatuKlinik' }
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
