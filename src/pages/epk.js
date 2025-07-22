import Head from 'next/head'
import Image from 'next/image'
import { FaInstagram, FaSpotify, FaTiktok } from 'react-icons/fa'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import dynamic from 'next/dynamic'
import CountUp from '../components/Countup'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

const Masonry = dynamic(() => import('masonic').then((mod) => mod.Masonry), {
  ssr: false
})

const flyers = [
  { src: '/img/epk/flyers/trees.jpg', width: 1200, height: 1697 },
  { src: '/img/epk/flyers/thornhill.jpg', width: 1200, height: 1692 },
  { src: '/img/epk/flyers/palm-reader.jpg', width: 1123, height: 1280 },
  { src: '/img/epk/flyers/holding-absence.jpg', width: 1080, height: 1350 },
  { src: '/img/epk/flyers/first-show.jpg', width: 1200, height: 1500 },
  { src: '/img/epk/flyers/anitc.jpg', width: 842, height: 1096 },
  { src: '/img/epk/flyers/anitc-2.jpg', width: 1200, height: 1502 }
]

const upcomingTours = [
  { src: '/img/epk/flyers/headline.jpg', width: 1080, height: 1351 },
  { src: '/img/epk/flyers/vower.jpg', width: 1448, height: 2048 },
  { src: '/img/epk/flyers/welsh-fest.jpeg', width: 1024, height: 1280 }
]

export default function epk() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()])

  return (
    <>
      <Head>
        <title>EPK | Love Is Noise Test</title>
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
          className="object-cover h-full w-full object-center"
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
          <p className="lg:text-lg text-gray-300 mb-6">
            From the opening track, "Devotion," where Humphrey's voice invokes
            passion and positivity, to the second track, "Soft Glow," the
            album's first single where he croons, "You are the one that shines
            on me," before launching into a throat-shredding exaltation of
            emotion amidst a crushing battery of slashing guitars and battering
            drums, it's clear from the onset that LOVE IS NOISE'S heartbeat is a
            thunderous one.
          </p>
          <p className="lg:text-lg text-gray-300">
            With <strong>“Hole In Me”</strong> and{' '}
            <strong>“All Eyes Shut”</strong>, Love is Noise is introducing three
            new band members with Sam Clark (Bass), Alex Ioannou (Guitar), and
            Joe Pink (Drums) joining the band.
          </p>
        </div>

        <div className="max-w-2xl lg:items-center mb-16 flex-col flex lg:flex-row gap-8 lg:gap-4 mx-auto px-8">
          <div className="flex-1">
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
        <div className="max-w-2xl mx-auto mb-16 px-8">
          <blockquote className="font-sans mb-2 font-bold uppercase text-2xl">
            “Hyperbole is a stock in trade for musicians, but To live in a
            different way is worthy of it. It’ll break your heart in places, and
            your face in others.”
          </blockquote>
          <span className="text-sm italic">James Hickie, Kerrang!</span>
        </div>
        <div className="max-w-2xl mx-auto px-8">
          <h4 className="text-3xl mb-8 uppercase font-sans font-bold text-white">
            Tours
          </h4>
        </div>
        <div className="max-w-6xl mx-auto px-8 mb-16">
          <p className="mb-2 text-lg">Upcoming / Unannounced</p>
          <Masonry
            items={upcomingTours}
            render={({ data, index, style }) => (
              <div key={index} style={style} className="m-2">
                <Image
                  src={data.src}
                  width={data.width}
                  height={data.height}
                  alt={`Tour flyer ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          />
        </div>
        <div className="max-w-2xl mx-auto mb-16 px-8">
          <h4 className="text-xl mb-6 uppercase font-sans font-bold text-white">
            Notable Ticket Sales
          </h4>

          <div>
            <p className="mb-2">
              <span className="text-yellow-300 font-bold uppercase">
                London ANITC '24
              </span>{' '}
              - 180 tickets sold without guestlist (sold out with no shows
              clashing)
            </p>
            <p>
              <span className="text-yellow-300 font-bold uppercase">
                London ANITC '25
              </span>{' '}
              - 130 tickets sold without guestlist (with 5 shows clashing)
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 mb-16">
          <p className="mb-2 text-lg">Previous</p>
          <Masonry
            items={flyers}
            render={({ data, index, style }) => (
              <div key={index} style={style} className="m-2">
                <Image
                  src={data.src}
                  width={data.width}
                  height={data.height}
                  alt={`Tour flyer ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          />
        </div>
        <div className="max-w-2xl mx-auto px-8">
          <h4 className="text-3xl mb-8 uppercase font-sans font-bold text-white">
            Streaming
          </h4>
        </div>
        <div className="max-w-2xl mx-auto px-8 mb-16 grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div>
            <CountUp
              from={0}
              to={73641}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text text-5xl font-bold"
            />
            <p>Monthly listeners</p>
          </div>
          <div>
            <CountUp
              from={0}
              to={2263626}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text text-5xl font-bold"
            />
            <p>Streams in last 12 months</p>
          </div>
          <div>
            <CountUp
              from={0}
              to={430835}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text text-5xl font-bold"
            />
            <p>Listeners in last 12 months</p>
          </div>
          <div>
            <CountUp
              from={0}
              to={981588}
              separator=","
              direction="up"
              duration={1}
              className="count-up-text text-5xl font-bold"
            />
            <p>Debut album streams</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-8 mb-16">
          <h4 className="text-3xl mb-8 uppercase font-sans font-bold text-white">
            Team
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-lg font-bold">Label</h5>
            </div>
            <div>
              <p>
                Century Media Records{' '}
                <a href="/api/download" className="text-yellow-300 block">
                  📄 Download Contract
                </a>
              </p>
            </div>
            <div>
              <h5 className="text-lg font-bold">Manager</h5>
            </div>
            <div>
              <p>Kath @ 5B (plz)</p>
            </div>
            <div>
              <h5 className="text-lg font-bold">Booking Agent</h5>
            </div>
            <div>
              <p>Joe Booley @ Atonal Agency</p>
            </div>
            <div>
              <h5 className="text-lg font-bold">PR Agent</h5>
            </div>
            <div>Emma Van Duyts @ Public City PR</div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-8 mb-16">
          <button
            onClick={() => signOut()}
            className="bg-white text-black font-bold text-sm px-3 py-1.5"
          >
            Logout
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-8 text-2xl flex gap-6">
          <a
            href="https://www.instagram.com/loveisnoiselr"
            target="_blank"
            className="text-yellow-300"
          >
            <FaInstagram />
          </a>
          <a
            href="https://open.spotify.com/artist/4qY6XGFQwZubu0oKBJeVki?si=G5Kl2J03SFmejf1QeOuYaQ"
            target="_blank"
            className="text-yellow-300"
          >
            <FaSpotify />
          </a>
          <a
            href="https://www.tiktok.com/@loveisnoiselr"
            target="_blank"
            className="text-yellow-300"
          >
            <FaTiktok />
          </a>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  return {
    props: { user: session.user }
  }
}
