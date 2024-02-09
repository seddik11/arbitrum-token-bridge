import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Disclosure } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

import { Transition } from './Transition'

const defaultHeaderClassName = 'z-40 flex h-[80px] justify-center'

const MenuIcon = {
  Open: function () {
    return (
      <svg
        width="40"
        height="24"
        viewBox="0 0 40 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="8" y1="1" x2="40" y2="1" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="8" y1="13" x2="40" y2="13" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="8" y1="25" x2="40" y2="25" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    )
  },
  Close: function () {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 29 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.8285 14.0005L27.4145 3.4145C28.1965 2.6325 28.1965 1.3685 27.4145 0.5865C26.6325 -0.1955 25.3685 -0.1955 24.5865 0.5865L14.0005 11.1725L3.4145 0.5865C2.6325 -0.1955 1.3685 -0.1955 0.5865 0.5865C-0.1955 1.3685 -0.1955 2.6325 0.5865 3.4145L11.1725 14.0005L0.5865 24.5865C-0.1955 25.3685 -0.1955 26.6325 0.5865 27.4145C0.9765 27.8045 1.4885 28.0005 2.0005 28.0005C2.5125 28.0005 3.0245 27.8045 3.4145 27.4145L14.0005 16.8285L24.5865 27.4145C24.9765 27.8045 25.4885 28.0005 26.0005 28.0005C26.5125 28.0005 27.0245 27.8045 27.4145 27.4145C28.1965 26.6325 28.1965 25.3685 27.4145 24.5865L16.8285 14.0005Z"
          fill="white"
        />
      </svg>
    )
  }
}

export type HeaderOverridesProps = {
  imageSrc?: string
  className?: string
}

export function HeaderOverrides({ imageSrc, className }: HeaderOverridesProps) {
  const header = document.getElementById('header')

  if (header) {
    if (className) {
      // Reset back to defaults and then add overrides on top of that
      header.className = defaultHeaderClassName
      header.classList.add(...className.split(' '))
    }

    const image = document.getElementById('header-image') as HTMLImageElement

    if (image && imageSrc) {
      image.src = imageSrc
    }
  }

  return null
}

export function HeaderContent({ children }: { children: React.ReactNode }) {
  const mutationObserverRef = useRef<MutationObserver>()
  const [, setMutationCycleCount] = useState(0)

  useEffect(() => {
    const header = document.getElementById('header')

    if (!header) {
      return
    }

    /**
     * On mobile, the header opens up and closes through a popover component by clicking the hamburger menu.
     * It's possible for the popover to be closed at the time of rendering this component.
     * This means that the portal root element won't be found, and nothing will be rendered to the portal.
     *
     * This is a little trick that sets up a `MutationObserver` to listen for changes to the header subtree.
     * Each time a mutation happens, it will call `setMutationCycleCount`, forcing a re-render to the portal.
     *
     * There's no real performance concern, as the contents of the header change very rarely.
     */
    const config = { subtree: true, childList: true }
    mutationObserverRef.current = new MutationObserver(() =>
      setMutationCycleCount(
        prevMutationCycleCount => prevMutationCycleCount + 1
      )
    )
    mutationObserverRef.current.observe(header, config)

    return () => mutationObserverRef.current?.disconnect()
  }, [])

  const rootElement = document.getElementById('header-content-root')

  if (!rootElement) {
    return null
  }

  return ReactDOM.createPortal(children, rootElement)
}

export function Header() {
  return (
    <header id="header" className={defaultHeaderClassName}>
      <div className="flex w-full max-w-[1440px] justify-between px-8">
        <div className="flex items-center lg:space-x-2 xl:space-x-12"></div>
        <Disclosure>
          {({ open }) => (
            <div className="flex items-center">
              {!open && (
                <Disclosure.Button
                  className="lg:hidden"
                  aria-label="Menu Toggle Button"
                >
                  <MenuIcon.Open />
                </Disclosure.Button>
              )}
              <Disclosure.Panel>
                <Transition>
                  <HeaderMobile />
                </Transition>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
        <div className="hidden flex-grow items-center justify-end lg:flex lg:space-x-2 xl:space-x-4">
          <div
            id="header-content-root"
            className="flex space-x-2 xl:space-x-4"
          ></div>
        </div>
      </div>
    </header>
  )
}

function HeaderMobile() {
  return (
    <div className="absolute left-0 top-0 z-50 min-h-screen w-full lg:hidden">
      <div className="flex h-[80px] items-center justify-end px-8">
        <Disclosure.Button className="text-white lg:hidden">
          <MenuIcon.Close />
        </Disclosure.Button>
      </div>
      <div className="flex min-h-screen flex-col items-center gap-1 bg-dark">
        <div
          id="header-content-root"
          className="flex w-full flex-col-reverse items-center pt-4"
        ></div>
      </div>
    </div>
  )
}
