import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <body className={inter.className}>
        <Toaster richColors position='top-center' />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
