import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignOutButton,
  SignedIn,
  UserButton,
} from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { esES } from '@clerk/localizations'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Vouchek',
  description: 'Vouchek',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { sessionClaims } = await auth()
  const role = sessionClaims?.Role as string | undefined
  const email = sessionClaims?.Email as string | undefined
  const superAdmins = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS ?? '')
    .split(';')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const isSuperAdmin = !!email && superAdmins.includes(email.toLowerCase())
  const canManageProfile = isSuperAdmin || role === 'org:admin'

  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SignedIn>
            <header className="flex flex-col gap-2">
              <nav className="flex gap-6 items-center justify-center bg-slate-100 py-3 border-b">
                <a href="/receipts" className="font-medium text-slate-700 hover:text-slate-900">Comprobantes</a>
                <a href="/users" className="font-medium text-slate-700 hover:text-slate-900">Usuarios</a>
                <a href="/configuration" className="font-medium text-slate-700 hover:text-slate-900">Configuracion</a>
                <div className="flex justify-end items-center p-4 gap-4 h-16">
                  {canManageProfile ? (
                    <UserButton />
                  ) : (
                    <SignOutButton>
                      <button className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Cerrar sesion
                      </button>
                    </SignOutButton>
                  )}
                </div>
              </nav>

            </header>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}