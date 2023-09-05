import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useKey } from 'react-use'
import PageTransition from '~/components/PageTransition'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'

const coreImages = ['/img/logo-new.png']
const galleryLength = 57

export default function Gallery() {
  const MotionLink = motion(Link)
  const [fullscreenImage, setFullscreenImage] = useState(null)

  useKey('ArrowLeft', () => {
    if (fullscreenImage !== null)
      setFullscreenImage((index) => (index > 1 ? index - 1 : 1))
  })

  useKey('ArrowRight', () => {
    if (fullscreenImage !== null)
      setFullscreenImage((index) =>
        index < galleryLength ? index + 1 : galleryLength
      )
  })

  useKey('Escape', () => {
    setFullscreenImage(null)
  })

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
      <div className="flex flex-col min-h-screen py-2 bg-[#121003]">
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
              className="text-center font-black uppercase text-white my-8 sm:my-10 lg:my-12 drop-shadow leading"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {Array.from({ length: galleryLength }, (_, i) => i + 1).map(
                  (i) => (
                    <>
                      <div className="aspect-w-1 aspect-h-1 bg-black shadow relative">
                        <img
                          src={`/img/gallery/lin-momento-bts-${i}.jpg`}
                          key={i}
                          className="object-cover absolute w-full h-full"
                          loading="lazy"
                          onClick={() => {
                            setFullscreenImage(i)
                          }}
                        />
                      </div>
                      {typeof document !== 'undefined'
                        ? createPortal(
                            // Fullscreen image
                            <AnimatePresence>
                              {fullscreenImage === i && (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.6 }}
                                  className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-90"
                                  onClick={() => {
                                    setFullscreenImage(null)
                                  }}
                                >
                                  <img
                                    src={`/img/gallery/lin-momento-bts-${i}.jpg`}
                                    className="object-contain max-h-full max-w-full"
                                    loading="lazy"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>,
                            document.body
                          )
                        : null}
                    </>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
