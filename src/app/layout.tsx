import { Metadata } from 'next'

import './index.css'

export const metadata: Metadata = {
  keywords: [
    'katsastus',
    'katsastustilasto',
    'tilasto',
    'auto',
    'vertailu',
    'luotettavuus',
    'vikatilasto',
    'vika',
    'viat',
  ],
  authors: [
    {
      name: 'Markus Tyrkkö',
      url: 'https://markustyrkko.fi',
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
  title: 'Katsastustilastot | Löydä luotettavin automalli',
  description:
    'Vertaile katsastustilastoja eri automerkkien ja -mallien välillä. Työkalu näyttää vikaprosentin kehityksen auton elinkaaren yli ja listaa eri automerkit ja -mallit paremmuusjärjestyksessä tilastojen perusteella.',
  openGraph: {
    type: 'article',
    siteName: 'Katsastustilastot',
    title: 'Katsastustilastot | Löydä luotettavin automalli',
    description:
      'Vertaile katsastustilastoja eri automerkkien ja -mallien välillä. Työkalu näyttää vikaprosentin kehityksen auton elinkaaren yli ja listaa eri automerkit ja -mallit paremmuusjärjestyksessä tilastojen perusteella.',
    url: 'https://katsastustilastot.eu',
    authors: ['Markus Tyrkkö'],
    publishedTime: '2023-11-17',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
