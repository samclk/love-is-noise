import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoSpotify from '~/components/icons/spotify'
import Link from 'next/link'
import MemoReddit from '~/components/icons/reddit'
import MemoPatreon from '~/components/icons/patreon'

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const coreImages = [
  '/img/homepage-bg.jpg',
  '/img/logo-black--super-rough.png',
  '/img/distress.png',
  '/img/logo-white--clean.png'
]

export default function Home() {
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    const promiseTimer = new Promise((resolve) => {
      setTimeout(resolve, 750)
    })
    const promiseImages = Promise.all(coreImages.map((src) => loadImage(src)))

    Promise.all([promiseImages, promiseTimer]).then(() => {
      setImagesLoaded(true)
    })
  }, [])

  return (
    <>
      <Head>
        {coreImages.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
        <title>Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Love Is Noise" />
        <meta property="og:description" content="WILL WE MEET SOMEDAY?" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-will-we-find-a-way.jpg?alt=media&token=cc081997-4005-4d21-9627-100bc9c6aa78"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Love Is Noise" />
        <meta name="twitter:description" content="WILL WE MEET SOMEDAY?" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-will-we-find-a-way.jpg?alt=media&token=cc081997-4005-4d21-9627-100bc9c6aa78"
        />

        <link rel="dns-prefetch" href="https://www.youtube.com"></link>
      </Head>
      <AnimatePresence>
        {imagesLoaded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-screen py-2"
          >
            <motion.img
              src="/img/homepage-bg.jpg"
              className="h-screen w-full fixed inset-0 object-cover"
              initial={{ opacity: 0, filter: 'blur(15px)' }}
              animate={{ opacity: 0.5, filter: 'blur(0px)' }}
              transition={{ duration: 1 }}
              alt=""
            />
            {/* <motion.img
              src="/img/logo-black--super-rough.png"
              className="h-screen w-full fixed inset-0 object-contain mix-blend-soft-light"
              initial={{ scale: 2.1, opacity: 0, rotate: 4 }}
              animate={{ scale: 2, opacity: 1, rotate: 0 }}
              transition={{ duration: 3 }}
              alt=""
            /> */}
            <motion.img
              src="/img/distress.png"
              className="h-screen w-full fixed inset-0 object-cover mix-blend-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              alt=""
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              className="container mx-auto relative z-10 flex-grow flex flex-col"
            >
              {/* <div className="flex justify-center items-center w-full lg:mb-10 space-x-2 md:space-x-4">
                <motion.a
                  href="https://www.facebook.com/loveisnoiselr"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoFacebook className="w-8 md:w-10 h-auto" />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/loveisnoiselr/"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoInstagram className="w-8 md:w-10 h-auto" />
                </motion.a>
                <motion.a href="/" whileTap={{ scale: 0.95 }}>
                  <img
                    src="/img/logo-white--clean.png"
                    className="w-52 md:w-64 lg:w-72 h-auto"
                  />
                </motion.a>
                <motion.a
                  href="https://www.reddit.com/r/loveisnoise/"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoReddit className="w-8 md:w-10 h-auto" />
                </motion.a>
                <motion.a
                  href="http://www.patreon.com/loveisnoise"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoPatreon className="w-8 md:w-10 h-auto" />
                </motion.a>
              </div> */}
              <div className="text-center flex-grow flex justify-center flex-col drop-shadow-md">
                <motion.a
                  href="https://youtu.be/nzF3yoF7N_E"
                  target="_blank"
                  rel="noopener"
                  className="text-[3vw] sm:text-[2.5vw] font-black uppercase text-white hover:invert cursor-pointer transition hover:scale-105 text-opacity-90"
                  animate={{ filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    repeatDelay: 8
                  }}
                >
                  <span className="whitespace-nowrap block">
                    It surrounds your mind, through space and time.
                  </span>
                  <span className="whitespace-nowrap block">
                    A plethora of wisdom, misguided by greed.
                  </span>
                  <span className="whitespace-nowrap block">
                    They need to feed, on those who believe.
                  </span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <img
            src="/img/logo-white--clean.png"
            className="w-56 lg:w-72 h-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </AnimatePresence>
    </>
  )
}
