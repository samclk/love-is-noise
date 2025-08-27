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
            <iframe
              width="540"
              height="305"
              src="https://7a004a0b.sibforms.com/serve/MUIFANwD4SoImfDyi2aEMsdbpOqC6doiM44gCrdhXOsq3zbyx7UpD_zrij4vqNcUs_S1_3Rm_6dPQQNL0fcGZXjhDdXjWVPzCmR7h1mgvStrHO1uTYMuzhFMhyOQJE9dj9t21rkcVz4DCwjHFbdAVFcmVBs8WXSvVcXYzAEcjcTeHggZSuL-OwVrSR5P7xlZmMKE8G98Y-Shjfvo"
              frameborder="0"
              scrolling="no"
              allowFullScreen
              style={{
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '100%'
              }}
            ></iframe>
            <BandsInTown />
          </motion.div>
        </div>
      </>
    </Page>
  )
}
