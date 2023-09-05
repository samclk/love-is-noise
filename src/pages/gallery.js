import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useKey } from 'react-use'
import Page from '~/components/Page'

const galleryLength = 57

export default function Gallery() {
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
    <Page className="flex flex-col min-h-screen bg-[#121003]">
      <Head>
        <title>Gallery | Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta property="og:title" content="Gallery | Love Is Noise" />
        <meta property="og:description" content="Memento" />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Gallery | Love Is Noise" />
        <meta name="twitter:description" content="Memento" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />
      </Head>
      <div className="text-center flex-grow flex justify-center flex-col drop-shadow-md font-sans font-bold sm:!pb-0">
        <motion.div
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
          transition={{ duration: 0.6 }}
          className="text-center font-black uppercase text-white mb-8 sm:mb-10 lg:mb-12 drop-shadow leading"
        >
          <div className="mb-8 lg:mb-16">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 lg:mb-4"
              style={{ textWrap: 'balance' }}
            >
              Memento Behind The Scenes
            </h1>
            <p className="text-sm sm:text-base lg:text-lg">
              Captured by Carl Battams
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 group">
            {Array.from({ length: galleryLength }, (_, i) => i + 1).map((i) => (
              <React.Fragment key={i}>
                <div
                  className="aspect-w-1 aspect-h-1 bg-black shadow relative xl:group-hover:opacity-50 xl:hover:!opacity-100 xl:transition-opacity hover:cursor-pointer"
                  onClick={() => {
                    setFullscreenImage(i)
                  }}
                >
                  <img
                    src={`/img/gallery/lin-momento-bts-${i}.jpg`}
                    className="object-cover absolute w-full h-full"
                    loading="lazy"
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
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </Page>
  )
}
