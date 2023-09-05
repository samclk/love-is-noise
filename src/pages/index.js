import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import PageTransition from '~/components/PageTransition'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'

const coreImages = ['/img/homepage-bg.jpg', '/img/logo-new.png']

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

export default function Home() {
  const MotionLink = motion(Link)

  return (
    <PageTransition>
      <Head>
        {coreImages.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
        <title>Love Is Noise - Memento</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Love Is Noise - Memento" />
        <meta property="og:description" content="Memento" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Love Is Noise - Memento" />
        <meta name="twitter:description" content="Memento" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />
      </Head>
      <div className="flex flex-col min-h-screen py-2">
        <img
          src="/img/homepage-bg.jpg"
          className="h-screen w-full fixed inset-0 object-cover opacity-50"
          alt=""
        />
        <div className="container mx-auto relative z-10 flex-grow flex flex-col">
          <div className="flex justify-center items-center w-full space-x-2 md:space-x-4 drop-shadow">
            <motion.a
              href="https://www.facebook.com/loveisnoiselr"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoFacebook className="w-8 h-auto" />
            </motion.a>
            <motion.a
              href="https://www.instagram.com/loveisnoiselr/"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoInstagram className="w-8 h-auto" />
            </motion.a>
            <MotionLink href="/" whileTap={{ scale: 0.95 }}>
              <img
                src="/img/logo-new.png"
                className="w-52 md:w-64 lg:w-72 h-auto"
              />
            </MotionLink>
            <motion.a
              href="https://www.reddit.com/r/loveisnoise/"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoReddit className="w-8 h-auto" />
            </motion.a>
            <motion.a
              href="http://www.patreon.com/loveisnoise"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoPatreon className="w-8 h-auto" />
            </motion.a>
          </div>
          <div className="text-center flex-grow flex justify-center flex-col drop-shadow-md font-sans font-bold sm:!pb-0">
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              exit={{ y: 10 }}
              transition={{ duration: 0.6 }}
              className="text-center font-black uppercase text-white my-8 sm:my-10 lg:my-16 drop-shadow leading"
            >
              <YouTubeCountdown />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl m-0">
                Love is Noise
              </h1>
              <span className="block text-3xl sm:text-4xl md:text-5xl m-0">
                Memento
              </span>
              <div className="flex justify-center gap-4">
                <motion.a
                  whileHover={{ backgroundColor: '#e22d2d' }}
                  whileTap={{ backgroundColor: '#e63939', scale: 0.95 }}
                  className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-red-600 text-white leading-none lg:text-lg italic shadow"
                  href="https://loveisnoise.bigcartel.com/products"
                  target="_blank"
                  rel="noopener"
                >
                  Shop merch
                </motion.a>
                <MotionLink
                  href="/gallery"
                  whileHover={{ borderColor: '#e22d2d' }}
                  whileTap={{
                    borderColor: '#e63939',
                    scale: 0.95,
                    color: '#e63939'
                  }}
                  className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 border-2 text-white leading-none lg:text-lg italic shadow"
                >
                  View Gallery
                </MotionLink>
              </div>
              <BandsInTown />
              {/* <MailChimpSignUp /> */}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
