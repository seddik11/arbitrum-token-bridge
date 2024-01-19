import React from 'react'
import satori, { Font } from 'satori'
import sharp from 'sharp'
import fs from 'fs'

const dimensions = {
  width: 1200,
  height: 627
} as const

async function getFont(): Promise<Font> {
  const roboto = fs.readFileSync('./Roboto-Regular.ttf')

  return {
    name: 'Roboto',
    data: roboto,
    weight: 400,
    style: 'normal'
  }
}

type Chain = {
  name: string
  slug: string
  logo: string
}

type ChainCombination = [Chain, Chain]

const configs: ChainCombination[] = [
  [
    {
      name: 'Ethereum',
      slug: 'ethereum',
      logo: 'https://l2beat.com/icons/ethereum.png'
    },
    {
      name: 'Arbitrum One',
      slug: 'arbitrum-one',
      logo: 'https://l2beat.com/icons/arbitrum.png'
    }
  ],
  [
    {
      name: 'Ethereum',
      slug: 'ethereum',
      logo: 'https://l2beat.com/icons/ethereum.png'
    },
    {
      name: 'Arbitrum Nova',
      slug: 'arbitrum-nova',
      logo: 'https://l2beat.com/icons/nova.png'
    }
  ],
  [
    {
      name: 'Arbitrum One',
      slug: 'arbitrum-one',
      logo: 'https://l2beat.com/icons/arbitrum.png'
    },
    {
      name: 'Xai',
      slug: 'xai',
      logo: 'https://bin.bnbstatic.com/static/research/xai.png'
    }
  ]
]

async function generateSvg({ from, to }: { from: Chain; to: Chain }) {
  const font = await getFont()
  const imageName = `${from.slug}-to-${to.slug}.jpg`

  console.log(`Generating ${imageName}`)

  const svg = await satori(
    //
    <div
      style={{
        ...dimensions,
        display: 'flex',
        flexDirection: 'column',
        color: 'black',
        justifyContent: 'space-between',
        padding: '2rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div />
        <img
          src="https://arbitrum.foundation/logo.png"
          width={64}
          height={64}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: 'white', fontSize: '6rem' }}>ARBITRUM</span>
        <span style={{ color: 'white', fontSize: '4rem' }}>BRIDGE</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ color: 'white', fontSize: '2rem' }}>
          Bridge from {from.name} to {to.name}
        </span>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <img src={from.logo} width={128} height={128} />
          <img src={to.logo} width={128} height={128} />
        </div>
      </div>
    </div>,
    {
      ...dimensions,
      fonts: [font]
    }
  )

  await sharp(Buffer.from(svg))
    .jpeg({ mozjpeg: true })
    .toFile(`./public/images/__auto-generated-og/${imageName}`)
}

async function main() {
  for (const combination of configs) {
    await generateSvg({ from: combination[0], to: combination[1] })
    await generateSvg({ from: combination[1], to: combination[0] })
  }
}

main()
