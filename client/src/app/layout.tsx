/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { Metadata } from 'next';
import React from 'react';
import ClientProviders from './ClientProviders';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://quantadv.io'), // Assuming quantadv.io, adapt as needed
  title: {
    default: 'QuantAdv | Institutional-Grade Algorithmic Sandbox',
    template: '%s | QuantAdv'
  },
  description: 'Deploy, backtest, and secure quantitative trading models against adversarial machine learning threats in a production-ready sandbox.',
  keywords: [
    'quantitative trading', 
    'algorithmic trading', 
    'adversarial machine learning', 
    'trading sandbox', 
    'financial modeling', 
    'explainable AI', 
    'XAI', 
    'quant finance', 
    'trading strategy backtesting',
    'AI trading defense'
  ],
  authors: [{ name: 'QuantAdv Research' }],
  creator: 'QuantAdv Research',
  publisher: 'QuantAdv Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'QuantAdv | Secure Quantitative Trading Sandbox',
    description: 'Test algorithmic trading models against adversarial ML attacks in real-time.',
    url: 'https://quantadv.io',
    siteName: 'QuantAdv',
    images: [
      {
        url: '/og-image.jpg', // Placeholder for OG image
        width: 1200,
        height: 630,
        alt: 'QuantAdv Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuantAdv | Secure Quantitative Trading Sandbox',
    description: 'Test algorithmic trading models against adversarial ML attacks in real-time.',
    creator: '@QuantAdv',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://quantadv.io',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://db.onlinewebfonts.com/c/04e6981992c0e2e7642af2074ebe3901?family=Helvetica+Now+Display+Bold" rel="stylesheet" type="text/css" />
        
        {/* Basic Organization Structured Data for AEO / GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "QuantAdv",
              "operatingSystem": "Web",
              "applicationCategory": "FinanceApplication",
              "description": "Institutional-Grade Algorithmic Sandbox for Quantitative Trading.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "QuantAdv Research",
                "url": "https://quantadv.io"
              }
            })
          }}
        />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
