import type { Metadata } from "next"
import { Work_Sans as WorkSans } from 'next/font/google'
import "./globals.css"

export const metadata: Metadata = {
  title: "Chat with Browser",
  description: "Chat with your own Browser",
}

const workSans = WorkSans({ subsets: ["latin"], display: "auto" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={workSans.className}>
      <body className="flex flex-col w-screen h-screen">{children}</body>
    </html>
  )
}
