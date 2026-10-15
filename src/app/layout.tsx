import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { ToastContainer } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/common/error_boundary';
import { SITE } from '@/config/site';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.og.image, width: 1200, height: 630 }],
  },
  twitter: {
    card: SITE.og.twitterCard,
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent FOUC — inject class from localStorage before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('hso_theme');
                var d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (d) document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
