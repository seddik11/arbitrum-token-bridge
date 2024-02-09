import localFont from 'next/font/local'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'
import EclipseBottom from '@/images/eclipse_bottom.png'

import { Header } from './Header'
import { Footer } from './Footer'
import { Toast } from './atoms/Toast'
import { SiteBanner } from './SiteBanner'
import { ExternalLink } from './ExternalLink'

import 'react-toastify/dist/ReactToastify.css'

const unica = localFont({
  src: [
    {
      path: '../../font/Unica77LLWeb-Light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../../font/Unica77LLWeb-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../font/Unica77LLWeb-Medium.woff2',
      weight: '500',
      style: 'normal'
    }
  ],
  variable: '--font-unica77',
  fallback: ['Roboto', 'sans-serif']
})

export type LayoutProps = {
  children: React.ReactNode
}

export function Layout(props: LayoutProps) {
  return (
    <div className={twMerge('relative flex-col', unica.className)}>
      <Image
        src={EclipseBottom}
        alt="grains"
        className="absolute left-1/2 top-0 w-full -translate-x-1/2 rotate-180 opacity-20"
        aria-hidden
      />
      <Image
        src={EclipseBottom}
        alt="grains"
        className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 opacity-20"
        aria-hidden
      />
      <div className="relative flex flex-col lg:min-h-screen">
        <SiteBanner>
          Arbitrum Orbit is mainnet-ready! Learn more about launching a
          customized chain{' '}
          <ExternalLink
            href="https://arbitrum.io/orbit"
            className="arb-hover underline"
          >
            here
          </ExternalLink>
          .
        </SiteBanner>
        <Header />

        <main className="grow">{props.children}</main>

        <Toast />
        <Footer />
      </div>
    </div>
  )
}
