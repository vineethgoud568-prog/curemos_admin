import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';
import { projectConfig } from '@/config/project-config';

import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import { ReactQueryClientProvider } from '@/lib/react-query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: projectConfig.name,
  description: '',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryClientProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster position="top-right" richColors />
          </ReactQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
