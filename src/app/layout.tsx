import type {Metadata} from 'next';
import { Space_Grotesk as FontSpaceGrotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const fontSpaceGrotesk = FontSpaceGrotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'TraceSmart - Product Traceability System',
  description: 'Smart, automated system for product labeling and traceability by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSpaceGrotesk.variable} dark`}>
      <head>
        {/* Google Font <link> tags removed, handled by next/font */}
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
