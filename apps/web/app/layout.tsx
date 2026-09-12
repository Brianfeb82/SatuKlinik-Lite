import './globals.css';
import { ServiceWorkerRegistration } from './sw-register';
export const metadata = { 
  title: 'SatuKlinik Lite — Smart EMR', 
  description: 'Offline-First Smart EMR + Auto-ICD SATUSEHAT',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
