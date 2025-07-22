import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import Countdown from 'react-countdown'
import Page from '~/components/Page'

const YouTubeCountdown = dynamic(
  () => import('~/components/YouTubeCountdown'),
  {
    ssr: false
  }
)

const BandsInTown = dynamic(() => import('~/components/BandsInTown'), {
  ssr: false
})

const MailChimpSignUp = dynamic(() => import('~/components/MailChimpSignUp'), {
  ssr: false
})

export default function Home() {
  const MotionLink = motion(Link)

  return (
    <Page
      background="/img/homepage-bg.jpg"
      className="flex flex-col min-h-screen"
    >
      <>
        <Head>
          <title>Love Is Noise</title>
          <link rel="canonical" href="https://loveisnoise.world" />

          <meta property="og:title" content="Love Is Noise" />
          <meta property="og:description" content="Jawbreaker" />
          <meta property="og:url" content="https://loveisnoise.world" />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-aug-24.jpg?alt=media&token=83622d77-c2b5-4327-9733-3b4af9fcd9eb"
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@whatsamtweets" />
          <meta name="twitter:title" content="Love Is Noise - Jawbreaker" />
          <meta name="twitter:description" content="Jawbreaker" />
          <meta
            name="twitter:image"
            content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-aug-24.jpg?alt=media&token=83622d77-c2b5-4327-9733-3b4af9fcd9eb"
          />
        </Head>
        <div className="text-center flex-grow flex justify-center items-center flex-col drop-shadow-md font-sans font-bold sm:!pb-0">
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            exit={{ y: -10 }}
            transition={{ duration: 0.6 }}
            className="text-center font-black uppercase text-white mb-8 sm:mb-10 lg:mb-16 drop-shadow leading w-full"
            suppressHydrationWarning
          >
            <YouTubeCountdown />
            <BandsInTown />
          </motion.div>
        </div>
      </>
    </Page>
  )
}
