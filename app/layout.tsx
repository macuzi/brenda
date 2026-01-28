// =============================================================================
// app/layout.tsx
// =============================================================================
// PURPOSE: Root layout - wraps all pages, includes global styles and metadata
// =============================================================================

// -----------------------------------------------------------------------------
// IMPORTS NEEDED
// -----------------------------------------------------------------------------
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';  // or any font
// import './globals.css';

// -----------------------------------------------------------------------------
// FONT SETUP (optional)
// -----------------------------------------------------------------------------
// const inter = Inter({ subsets: ['latin'] });

// -----------------------------------------------------------------------------
// METADATA
// -----------------------------------------------------------------------------
// export const metadata: Metadata = {
//   title: 'Brenda - AI Accessibility Scanner',
//   description: 'Scan your website for accessibility issues and get AI-generated fixes',
// };

// -----------------------------------------------------------------------------
// ROOT LAYOUT COMPONENT
// -----------------------------------------------------------------------------
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {children}
//       </body>
//     </html>
//   );
// }

// -----------------------------------------------------------------------------
// NOTES
// -----------------------------------------------------------------------------
// - Keep this minimal - just wraps pages with HTML structure
// - Global styles come from globals.css
// - Metadata here applies to all pages
// - Can add header/footer components here if needed later
