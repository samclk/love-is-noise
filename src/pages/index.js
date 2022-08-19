import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'

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
  '/img/logo-new.png'
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

  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  const updateHeaderHeight = () => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
  }

  useLayoutEffect(updateHeaderHeight, [headerRef.current])

  useEffect(() => {
    if (process.browser) {
      window.addEventListener('resize', updateHeaderHeight)

      return () => {
        window.removeEventListener('resize', updateHeaderHeight)
      }
    }
  }, [])

  return (
    <>
      <Head>
        {coreImages.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
        <title>Love Is Noise - Movement</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Love Is Noise - Movement" />
        <meta property="og:description" content="30/08/22" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-jan-22.jpg?alt=media&token=ee312d5b-958c-48ff-9294-a2878b5e0912"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Love Is Noise - Movement" />
        <meta name="twitter:description" content="30/08/22" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-jan-22.jpg?alt=media&token=ee312d5b-958c-48ff-9294-a2878b5e0912"
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
            onAnimationComplete={updateHeaderHeight}
          >
            <motion.img
              src="/img/homepage-bg.jpg"
              className="h-screen w-full fixed inset-0 object-cover"
              initial={{ opacity: 0, filter: 'blur(15px)' }}
              animate={{ opacity: 0.5, filter: 'blur(0px)' }}
              transition={{ duration: 1 }}
              alt=""
            />
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
              <div
                className="flex justify-center items-center w-full lg:mb-10 space-x-2 md:space-x-4 drop-shadow"
                ref={headerRef}
              >
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
                <motion.a href="/" whileTap={{ scale: 0.95 }}>
                  <img
                    src="/img/logo-new.png"
                    className="w-52 md:w-64 lg:w-72 h-auto"
                  />
                </motion.a>
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
              <div
                className="text-center flex-grow flex justify-center flex-col drop-shadow-md font-sans font-bold"
                // style={{ paddingBottom: headerHeight }}
              >
                <Countdown
                  date={new Date('2022-01-23T12:00:00+0000')}
                  className="text-[10vw] sm:text-[7.5vw] font-black uppercase text-white text-opacity-90"
                >
                  <motion.div
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, delay: 2.75 }}
                    className="text-center font-black uppercase text-white my-8 sm:my-10 lg:my-16 drop-shadow leading"
                  >
                    {/* <div className="max-w-2xl mx-auto mb-8">
                      <div className="aspect-w-16 aspect-h-9 bg-black shadow">
                        <iframe
                          src="https://www.youtube.com/embed/hC36JimuVYk"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div> */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl m-0">
                      Love is Noise
                    </h1>
                    <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider m-0">
                      Movement
                    </span>
                    <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl m-0">
                      30/08/22
                    </span>
                    <motion.a
                      whileHover={{ backgroundColor: '#e22d2d' }}
                      whileTap={{ backgroundColor: '#e63939', scale: 0.95 }}
                      className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-red-600 text-white leading-none lg:text-lg italic shadow"
                      href="https://altersongs.lnk.to/Movement"
                      target="_blank"
                      rel="noopener"
                    >
                      <span className="mt-1">Presave</span>
                    </motion.a>
                    <p></p>
                  </motion.div>
                </Countdown>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <img
            src="/img/logo-new.png"
            className="w-56 lg:w-72 h-auto fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </AnimatePresence>
    </>
  )
}
