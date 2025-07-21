import Head from 'next/head'
import Image from 'next/image'
import { FaInstagram } from 'react-icons/fa'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

export default function epk() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])
  return (
    <>
      <Head>
        <title>EPK | Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world/epk" />
        <meta property="og:title" content="EPK | Love Is Noise" />
        <meta
          property="og:description"
          content="Electronic Press Kit for Love Is Noise"
        />
        <meta property="og:url" content="https://loveisnoise.world/epk" />
        <meta property="og:type" content="website" />
      </Head>
      <div className="sticky top-0 h-[60vh] lg:h-screen">
        <Image
          src="/img/epk/page-header.jpg"
          height={1080}
          width={1920}
          alt="Love Is Noise Promo"
          className="object-cover h-full object-center"
        />
        <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/img/logo.png"
            height={200}
            width={400}
            alt="Love Is Noise Logo"
          />
          <div className="text-center">
            <h1 className="font-sans font-bold">Electronic Press Kit</h1>
            <p>
              Contact:&nbsp;
              <a
                href="mailto:cam@newbreedartists.com"
                className="text-yellow-300 underline"
              >
                cam@newbreedartists.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-20 py-16 lg:py-24 bg-black">
        <div className="max-w-2xl mx-auto mb-16 px-8">
          <h2 className="text-3xl uppercase font-sans font-bold text-white mb-4">
            Biography
          </h2>
          <p className="lg:text-lg text-gray-300 mb-6">
            LOVE IS NOISE is an exercise in empathy, both lyrically and
            musically.
          </p>
          <p className="lg:text-lg text-gray-300 mb-6">
            The band's Century Media debut, To live in a different way,
            straddles the roughshod riffing and volume of their DIY origins
            while embracing shoegaze-facing melodiousness, hints of Brit-pop,
            and a beating (and bleeding) heart erupting from Cam Humphrey's
            plaintive vocals. Co-produced by the band with engineer Kel Pinchin
            and mixed by John Markson (Drug Church, Drain, The Story So Far), To
            live in a different way is a startling debut album.
          </p>
          <p className="lg:text-lg text-gray-300">
            From the opening track, "Devotion," where Humphrey's voice invokes
            passion and positivity, to the second track, "Soft Glow," the
            album's first single where he croons, "You are the one that shines
            on me," before launching into a throat-shredding exaltation of
            emotion amidst a crushing battery of slashing guitars and battering
            drums, it's clear from the onset that LOVE IS NOISE'S heartbeat is a
            thunderous one.
          </p>
        </div>

        <div className="max-w-2xl items-center mb-16 flex-col flex lg:flex-row gap-8 lg:gap-4 mx-auto px-8">
          <div className="flex-1 w-full">
            <h3 className="text-2xl font-semibold text-white mb-6">Members</h3>
            <ul className="text-gray-300">
              <li className="mb-4">
                <strong className="flex items-center gap-2">
                  Cameron Jones-Humphrey{' '}
                  <a
                    href="https://www.instagram.com/hoachyboy/"
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-300 underline"
                  >
                    <FaInstagram />
                  </a>
                </strong>{' '}
                Vocals
              </li>
              <li className="mb-4">
                <strong className="flex items-center gap-2">
                  Sam Clark{' '}
                  <a
                    href="https://www.instagram.com/sam.cl.rk/"
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-300 underline"
                  >
                    <FaInstagram />
                  </a>
                </strong>{' '}
                Bass
              </li>
              <li className="mb-4">
                <strong className="flex items-center gap-2">
                  Alex Ioannou{' '}
                  <a
                    href="https://www.instagram.com/alexanderproduces/"
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-300 underline"
                  >
                    <FaInstagram />
                  </a>
                </strong>{' '}
                Guitar
              </li>
              <li>
                <strong className="flex items-center gap-2">
                  Joe Pink{' '}
                  <a
                    href="https://www.instagram.com/notjoepink/"
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-300 underline"
                  >
                    <FaInstagram />
                  </a>
                </strong>{' '}
                Drums
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <blockquote className="font-sans mb-2 font-bold uppercase text-2xl">
              “Love Is Noise stands as a bold reminder of how the most honest
              and raw expressions of feeling can still carve their own unique
              niche.”
            </blockquote>
            <span className="text-sm italic">
              Kieran Thompson, Boolin Tunes
            </span>
          </div>
        </div>
        <div className="embla overflow-hidden mb-16" ref={emblaRef}>
          <div className="embla__container flex">
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-1.jpg"
                width={1000}
                height={1500}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-2.jpg"
                width={2048}
                height={1368}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-3.jpg"
                width={1200}
                height={1800}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-4.jpg"
                width={1600}
                height={1067}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-5.jpg"
                width={1600}
                height={2400}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
            <div className="embla__slide flex-[0_0_auto] min-w-0 max-w-full">
              <Image
                src="/img/epk/swiper/slide-6.jpg"
                width={1600}
                height={1067}
                className="h-[300px] w-auto object-cover object-center"
              />
            </div>
          </div>
        </div>
        <div className="max-w-2xl items-center mx-auto mb-16 px-8">
          <h2 className="text-3xl mb-8 uppercase font-sans font-bold text-white">
            Discography
          </h2>
          <div className="grid gap-8 grid-cols-2 mb-12">
            <div>
              <Image
                src="/img/epk/hole-in-me.webp"
                height={200}
                width={200}
                alt="hole in me album cover"
              />
            </div>
            <div>
              <h4 className="font-sans font-bold uppercase lg:text-xl">
                Hole in Me / All Eyes Shut (feat. Erik Bickerstaffe)
              </h4>
              <p>
                Single (Latest release) (2025) |{' '}
                <a
                  className="text-yellow-300 underline"
                  href="https://open.spotify.com/album/0hzrir5Egz7hPHqamJ4nvk?si=JkrrBPI6QOuGuKn9T6hOSA"
                >
                  Listen
                </a>
              </p>
            </div>
            <div>
              <Image
                src="/img/epk/tliadw.jpg"
                height={200}
                width={200}
                alt="TLIADW album cover"
              />
            </div>
            <div>
              <h4 className="font-sans font-bold uppercase lg:text-xl">
                To live in a different way
              </h4>
              <p>
                Album (2024) |{' '}
                <a
                  className="text-yellow-300 underline"
                  href="https://open.spotify.com/album/2y8QlFM8O9zhONQsQpFgsv?si=IQ9Q9GJfTuGYRpbqJEh0lA"
                >
                  Listen
                </a>
              </p>
            </div>
            <div>
              <Image
                src="/img/epk/euphoria.jpg"
                height={200}
                width={200}
                alt="Euphoria cover"
              />
            </div>
            <div>
              <h4 className="font-sans font-bold uppercase lg:text-xl">
                Euphoria, where were you?
              </h4>
              <p>
                EP (2022) |{' '}
                <a
                  className="text-yellow-300 underline"
                  href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                >
                  Listen
                </a>
              </p>
            </div>
          </div>
          <div>
            <h5 className="text-lg uppercase font-bold">Previous Singles</h5>
            <div className="flex flex-col gap-2">
              <div>
                <p>
                  Memento |{' '}
                  <a
                    className="text-yellow-300 underline"
                    href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                  >
                    Listen
                  </a>
                </p>
              </div>
              <div>
                <p>
                  Boutique |{' '}
                  <a
                    className="text-yellow-300 underline"
                    href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                  >
                    Listen
                  </a>
                </p>
              </div>
              <div>
                <p>
                  In the shadow of your former self |{' '}
                  <a
                    className="text-yellow-300 underline"
                    href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                  >
                    Listen
                  </a>
                </p>
              </div>
              <div>
                <p>
                  Azure |{' '}
                  <a
                    className="text-yellow-300 underline"
                    href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                  >
                    Listen
                  </a>
                </p>
              </div>
              <div>
                <p>
                  Pillowcase |{' '}
                  <a
                    className="text-yellow-300 underline"
                    href="https://open.spotify.com/album/5F3s345rSD0UJe8IWo3imC?si=vnMg7_xJTBWgymIKBwrjlw"
                  >
                    Listen
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-8">
          <blockquote className="font-sans mb-2 font-bold uppercase text-2xl">
            “Hyperbole is a stock in trade for musicians, but To live in a
            different way is worthy of it. It’ll break your heart in places, and
            your face in others.”
          </blockquote>
          <span className="text-sm italic">James Hickie, Kerrang!</span>
        </div>
      </div>
    </>
  )
}
