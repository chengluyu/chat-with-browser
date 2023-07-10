import type { Metadata } from "next"
import { Public_Sans as PublicSans } from 'next/font/google'
import "./globals.css"

export const metadata: Metadata = {
  title: "Chat with Browser",
  description: "Chat with your own Browser",
}

const publicSans = PublicSans({ subsets: ["latin"], display: "auto" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={publicSans.className}>
      <body className="flex flex-col w-screen h-screen">{children}</body>
    </html>
  )
}
