import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoSpotify from '~/components/icons/spotify'

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const coreImages = [
  '/img/background.png',
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
        <title>Love Is Noise - Pillowcase</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Love Is Noise - Pillowcase" />
        <meta property="og:description" content="Stream Pillowcase now" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-pillowcase-post-release.jpg?alt=media&token=474e829a-a668-4ef8-8948-4f6a5f12387a"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Love Is Noise - Pillowcase" />
        <meta name="twitter:description" content="Stream Pillowcase now" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-pillowcase-post-release.jpg?alt=media&token=474e829a-a668-4ef8-8948-4f6a5f12387a"
        />

        <link rel="dns-prefetch" href="https://www.youtube.com"></link>
      </Head>
      <AnimatePresence>
        {imagesLoaded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen py-2"
          >
            <motion.img
              src="/img/background.png"
              className="h-screen w-full fixed inset-0 object-cover"
              initial={{ scale: 2 }}
              animate={{ scale: 1.2 }}
              transition={{ duration: 2 }}
            />
            <motion.img
              src="/img/logo-black--super-rough.png"
              className="h-screen w-full fixed inset-0 object-contain mix-blend-soft-light"
              initial={{ scale: 2.1, opacity: 0, rotate: 4 }}
              animate={{ scale: 2, opacity: 1, rotate: 0 }}
              transition={{ duration: 3 }}
            />
            <motion.img
              src="/img/distress.png"
              className="h-screen w-full fixed inset-0 object-cover mix-blend-overlay"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.75 }}
              className="container mx-auto relative z-10"
            >
              <div className="flex justify-center items-center w-full lg:mb-10">
                <motion.a
                  href="https://www.facebook.com/loveisnoiselr"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoFacebook width={44} height={44} />
                </motion.a>
                <motion.a href="/" whileTap={{ scale: 0.95 }}>
                  <img
                    src="/img/logo-white--clean.png"
                    className="w-52 md:w-64 lg:w-72 h-auto"
                  />
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/loveisnoiselr/"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoInstagram width={44} height={44} />
                </motion.a>
              </div>
              <div className="max-w-5xl mx-auto">
                <div className="aspect-w-16 aspect-h-9 bg-black shadow">
                  <iframe
                    src="https://www.youtube.com/embed/M8RxCsmHo74"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <motion.div
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 2.75 }}
                className="text-center font-black uppercase text-primary my-6 mb-8 sm:my-10 lg:my-16 drop-shadow leading"
              >
                <h1 className="text-4xl sm:text-5xl m-0">Love is Noise</h1>
                <span className="block text-3xl sm:text-4xl m-0">
                  Pillowcase
                </span>
                <span className="block text-2xl sm:text-3xl m-0">Out Now</span>

                <motion.a
                  whileHover={{ backgroundColor: '#fff052' }}
                  whileTap={{ backgroundColor: '#bdaf21', scale: 0.95 }}
                  className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-primary text-black leading-none lg:text-lg italic shadow"
                  href="https://open.spotify.com/artist/4qY6XGFQwZubu0oKBJeVki?si=9x80Bzn9QRK8vqaSy9llRA"
                  target="_blank"
                  rel="noopener"
                >
                  <MemoSpotify />
                  <span className="mt-1">Stream now</span>
                </motion.a>
              </motion.div>
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
