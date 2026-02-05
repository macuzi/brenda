
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';  // or any font
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Brenda - AI Accessibility Scanner',
  description: 'Scan your website for accessibility issues and get AI-generated fixes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
