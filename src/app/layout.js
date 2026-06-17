import './globals.css'

export const metadata = {
  title: 'Store Rating App',
  description: 'Rate your favorite stores',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
