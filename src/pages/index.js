import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import MemoFacebook from '~/components/icons/facebook'
import MemoTwitter from '~/components/icons/twitter'

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
    Promise.all(coreImages.map((src) => loadImage(src))).then(() => {
      setTimeout(() => {
        setImagesLoaded(true)
      }, 200)
    })
  }, [])

  return (
    <>
      <Head>
        <title>Love Is Noise</title>
        <link rel="icon" href="/favicon.ico" />
        {coreImages.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
      </Head>
      <AnimatePresence>
        {imagesLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
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
                  href="https://facebook.com"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoFacebook width={44} height={44} />
                </motion.a>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src="/img/logo-white--clean.png"
                    className="w-56 lg:w-72 h-auto"
                  />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MemoTwitter width={44} height={44} />
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
                className="text-center font-black uppercase text-primary mt-8 sm:mt-10 lg:mt-16 drop-shadow leading"
              >
                <h1 className="text-4xl sm:text-5xl m-0">Love is Noise</h1>
                <span className="block text-3xl sm:text-4xl m-0">
                  Pillowcase
                </span>
                <span className="block text-2xl sm:text-3xl m-0">Out Now</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
