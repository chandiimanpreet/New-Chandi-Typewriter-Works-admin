import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

import { ModalProvider } from '@/providers/modal-provider'

import './globals.css'
import prismadb from '@/lib/prismadb';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Admin Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {


    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <div className='bg-gray-300'>
                        <ModalProvider />
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    )
}
