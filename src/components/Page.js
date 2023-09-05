import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'
import Link from 'next/link'
import Head from 'next/head'

function Page({ children, background, ...rest }, ref) {
  const MotionLink = motion(Link)
  const initial = { opacity: 0 }
  const animate = { opacity: 1 }
  const exit = { opacity: 0 }

  const transition = { duration: 0.6, ease: 'easeInOut' }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...rest}
    >
      <Head>
        <link rel="preload" href="/img/logo.png" as="image" />
        {background && <link rel="preload" href={background} as="image" />}
      </Head>
      {background && (
        <img
          src={background}
          className="h-screen w-full fixed inset-0 object-cover opacity-50"
          alt=""
        />
      )}
      <div className="container mx-auto relative z-10 flex-grow flex flex-col">
        <header className="sm:space-y-8 sm:py-16 space-y-6 py-10">
          <div className="flex justify-center items-center w-full">
            <MotionLink href="/" whileTap={{ scale: 0.95 }}>
              <img
                src="/img/logo.png"
                className="w-64 md:w-72 lg:w-96 h-auto"
              />
            </MotionLink>
          </div>
          <nav className="flex justify-center items-center gap-4 sm:gap-8">
            <div className="flex justify-center items-center gap-2 md:gap-4 font-black text-sm sm:text-base uppercase">
              <MotionLink href="/gallery" whileTap={{ scale: 0.95 }}>
                Gallery
              </MotionLink>
              <MotionLink href="/contact" whileTap={{ scale: 0.95 }}>
                Contact
              </MotionLink>
            </div>
            <div className="flex justify-center items-center gap-2 md:gap-4">
              <motion.a
                href="https://www.facebook.com/loveisnoiselr"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <MemoFacebook className="w-6 sm:w-8 h-auto" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/loveisnoiselr/"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <MemoInstagram className="w-6 sm:w-8 h-auto" />
              </motion.a>
              <motion.a
                href="https://www.reddit.com/r/loveisnoise/"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <MemoReddit className="w-6 sm:w-8 h-auto" />
              </motion.a>
              <motion.a
                href="http://www.patreon.com/loveisnoise"
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <MemoPatreon className="w-6 sm:w-8 h-auto" />
              </motion.a>
            </div>
          </nav>
        </header>
        {children}
      </div>
    </motion.div>
  )
}

export default forwardRef(Page)
