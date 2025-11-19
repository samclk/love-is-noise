import Image from 'next/image'
import Link from 'next/link'
import Youtube from '@/components/Youtube'
import { SocialStrip } from '@/components/SocialStrip'
import { Button } from '@/components/Button'

const storeLinks = [
  {
    label: 'uk store',
    href: 'https://loveisnoise.myshopify.com/'
  },
  {
    label: 'eu store',
    href: 'https://www.impericon.com/collections/love-is-noise/'
  }
]

const otherLinks = [
  {
    label: 'tour',
    href: 'https://www.bandsintown.com/a/245374-love-is-noise'
  },
  {
    label: 'mailing list',
    href: '/sign-up'
  }
]

export default function Home() {
  return (
    <>
      {/* <div className="h-screen w-full object-center fixed inset-0 -z-10">
        <Image
          src="/bg.jpg"
          alt="Love Is Noise Background"
          width={2048}
          height={1365}
          className="object-cover opacity-20 object-center h-full w-full"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-black to-transparent"></div>
      </div> */}

      <div className="max-w-5xl mx-auto px-4">
        <Image
          src="/img/lin-scythe-logo.png"
          alt="Love Is Noise Logo"
          width={1400}
          height={774}
        />
      </div>

      <div className="flex flex-col lg:flex-row px-4 gap-4 justify-center">
        {storeLinks.map((link) => (
          <Button href={link.href} label={link.label} key={link.label} />
        ))}
        {otherLinks.map((link) => (
          <Button href={link.href} label={link.label} key={link.label} />
        ))}
      </div>
      <div className="my-12 lg:my-28 max-w-6xl flex flex-col gap-6 mx-auto px-4">
        <Youtube videoId="KThjpBTRK-4" />
        <Youtube videoId="SgcDGfiFGcM" />
      </div>
      <SocialStrip />
    </>
  )
}
