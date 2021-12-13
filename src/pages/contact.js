import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoSpotify from '~/components/icons/spotify'
import Link from 'next/link'

const container = {
  show: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact - Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world/contact" />

        <meta property="og:title" content="Contact - Love Is Noise" />
        <meta property="og:description" content="Get in touch" />
        <meta property="og:url" content="https://loveisnoise.world/contact" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-pillowcase-post-release.jpg?alt=media&token=474e829a-a668-4ef8-8948-4f6a5f12387a"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Contact - Love Is Noise" />
        <meta name="twitter:description" content="Get in touch" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-pillowcase-post-release.jpg?alt=media&token=474e829a-a668-4ef8-8948-4f6a5f12387a"
        />
      </Head>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col min-h-screen py-8 justify-center"
        >
          <motion.img
            src="/img/background.png"
            className="h-screen w-full fixed inset-0 object-cover"
            initial={{ scale: 2, opacity: 0.25 }}
            animate={{ scale: [1.2, 2] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />

          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center font-black uppercase text-primary my-6 mb-8 sm:my-10 lg:my-16 drop-shadow leading flex-grow flex flex-col justify-between"
          >
            <div>
              <h1 className="text-4xl sm:text-5xl m-0">Love is Noise</h1>
              <h2 className="block text-3xl sm:text-4xl m-0">Get In touch</h2>
            </div>
            <motion.dl
              variants={container}
              initial="hidden"
              animate="show"
              className="grid lg:grid-cols-2 lg:grid-rows-4 lg:gap-2 w-full max-w-xl text-sm mt-12 mb-10"
            >
              <motion.dt
                variants={item}
                className="text-center lg:text-left text-base lg:text-sm"
              >
                Agent
              </motion.dt>
              <motion.dd
                variants={item}
                className="text-center lg:text-right mb-4 lg:mb-0"
              >
                <a
                  href="mailto:paul.ryan@unitedtalent.com"
                  className="underline hover:text-white transition"
                >
                  paul.ryan@unitedtalent.com
                </a>
              </motion.dd>
              <motion.dt
                variants={item}
                className="text-center lg:text-left text-base lg:text-sm"
              >
                Agent Assistant
              </motion.dt>
              <motion.dd
                variants={item}
                className="text-center lg:text-right mb-4 lg:mb-0"
              >
                <a
                  href="mailto:zoe.swindells@unitedtalent.com"
                  className="underline hover:text-white transition"
                >
                  zoe.swindells@unitedtalent.com
                </a>
              </motion.dd>
              <motion.dt
                variants={item}
                className="text-center lg:text-left text-base lg:text-sm"
              >
                Management
              </motion.dt>
              <motion.dd
                variants={item}
                className="text-center lg:text-right mb-4 lg:mb-0"
              >
                N/A
              </motion.dd>
              <motion.dt
                variants={item}
                className="text-center lg:text-left text-base lg:text-sm"
              >
                Direct Contact
              </motion.dt>
              <motion.dd
                variants={item}
                className="text-center lg:text-right mb-4 lg:mb-0"
              >
                <a
                  href="mailto:loveisnoirlr@gmail.com"
                  className="underline hover:text-white transition"
                >
                  loveisnoirlr@gmail.com
                </a>
              </motion.dd>
            </motion.dl>
            <Link href="/">
              <a className="block mt-4 underline hover:text-white transition">
                Back to site
              </a>
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
