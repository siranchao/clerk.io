import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import './globals.css'
import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'
import TRPCProvider from '@/components/providers/TRPCProvider'
import { Toaster } from '@/components/ui/toaster'
import { constructMetadata } from '@/lib/metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>

      <html lang="en">
        <TRPCProvider>
          <body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}>
            <Toaster />
            <Navbar /> 
            {children}
          </body>
        </TRPCProvider>
      </html>

    </ClerkProvider>
  )
}
