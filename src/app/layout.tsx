export const metadata = {
  title: 'Pen Pals - Write Together',
  description: 'A minimal collaborative novel writing platform.',
};

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '@/context/AppContext';
import { LiveblocksProviderWrapper } from '@/components/LiveblocksProviderWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>
          <LiveblocksProviderWrapper>
            <AppProvider>
              {children}
            </AppProvider>
          </LiveblocksProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
