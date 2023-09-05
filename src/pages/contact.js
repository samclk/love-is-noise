import { AnimatePresence, motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import PageTransition from '~/components/PageTransition'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'

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
  const MotionLink = motion(Link)

  return (
    <PageTransition>
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
      <div className="flex flex-col min-h-screen py-8 justify-center">
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
          <div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex justify-center items-center w-full lg:mb-10 space-x-2 md:space-x-4"
            >
              <motion.a
                href="https://www.facebook.com/loveisnoiselr"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
                variants={item}
              >
                <MemoFacebook className="w-8 md:w-10 h-auto" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/loveisnoiselr/"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
                variants={item}
              >
                <MemoInstagram className="w-8 md:w-10 h-auto" />
              </motion.a>
              <motion.a
                href="https://www.reddit.com/r/loveisnoise/"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
                variants={item}
              >
                <MemoReddit className="w-8 md:w-10 h-auto" />
              </motion.a>
              <motion.a
                href="http://www.patreon.com/loveisnoise"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
                variants={item}
              >
                <MemoPatreon className="w-8 md:w-10 h-auto" />
              </motion.a>
            </motion.div>
            <dl className="grid lg:grid-cols-2 lg:grid-rows-4 lg:gap-2 w-full max-w-xl text-sm mt-12 mb-10">
              <dt className="text-center lg:text-left text-base lg:text-sm">
                Press / General Enquiries
              </dt>
              <dd className="text-center lg:text-right mb-4 lg:mb-0">
                <a
                  href="mailto:loveisnoiselr@gmail.com"
                  className="underline hover:text-white transition"
                >
                  loveisnoiselr@gmail.com
                </a>
              </dd>
            </dl>
          </div>
          <MotionLink
            href="/"
            className="block mt-4 underline hover:text-white transition"
          >
            Back to site
          </MotionLink>
        </motion.div>
      </div>
    </PageTransition>
  )
}
