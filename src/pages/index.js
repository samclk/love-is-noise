import { motion } from 'framer-motion'
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

// const MailChimpSignUp = dynamic(() => import('~/components/MailChimpSignUp'), {
//   ssr: false
// })
const date = '2024-06-05T10:00:00+0100'

export default function Home() {
  const MotionLink = motion(Link)

  return (
    <Page
      // background="/img/homepage-bg.jpg"
      className="flex flex-col min-h-screen"
    >
      <Head>
        <title>Love Is Noise - Memento</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Love Is Noise - Memento" />
        <meta property="og:description" content="Memento" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-sept-23.jpg?alt=media&token=b61196a7-aa9d-445c-be75-e45e02097442"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Love Is Noise - Memento" />
        <meta name="twitter:description" content="Memento" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-sept-23.jpg?alt=media&token=b61196a7-aa9d-445c-be75-e45e02097442"
        />
      </Head>
      <div className="text-center flex-grow flex justify-start flex-col drop-shadow-md font-sans font-bold sm:!pb-0">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          transition={{ duration: 0.6 }}
          className="text-center font-black uppercase text-white my-8 sm:my-10 lg:my-16 drop-shadow leading"
          suppressHydrationWarning
        >
          <Countdown
            date={new Date(date)}
            className="text-[15vw] sm:text-[10vw] md:text-[7.5vw] lg:text-[120px] font-black uppercase text-white text-opacity-90"
          />
          {/* <YouTubeCountdown />
          <BandsInTown /> */}
          {/* <MailChimpSignUp /> */}
        </motion.div>
      </div>
    </Page>
  )
}
