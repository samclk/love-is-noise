import { motion } from 'framer-motion'
import Head from 'next/head'
import Page from '~/components/Page'

export default function Contact() {
  return (
    <Page
      background="/img/gallery/lin-momento-bts-34.jpg"
      className="flex flex-col min-h-screen py-8 justify-center"
    >
      <Head>
        <title>Contact | Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world/contact" />

        <meta property="og:title" content="Contact | Love Is Noise" />
        <meta property="og:description" content="Get in touch" />
        <meta property="og:url" content="https://loveisnoise.world/contact" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-sept-23.jpg?alt=media&token=b61196a7-aa9d-445c-be75-e45e02097442"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta name="twitter:title" content="Contact | Love Is Noise" />
        <meta name="twitter:description" content="Get in touch" />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-sept-23.jpg?alt=media&token=b61196a7-aa9d-445c-be75-e45e02097442"
        />
      </Head>
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto text-center font-black uppercase text-white my-6 mb-8 sm:my-10 lg:my-16 drop-shadow"
      >
        <div>
          <dl className="grid lg:grid-cols-2 lg:grid-rows-4 lg:gap-2 w-full max-w-xl text-sm mt-12 mb-10">
            <dt className="text-center lg:text-left text-base lg:text-sm">
              Press
            </dt>
            <dd className="text-center lg:text-right mb-4 lg:mb-0">
              <a
                href="mailto:evd@publiccitypr.com"
                className="underline hover:text-white transition"
              >
                evd@publiccitypr.com
              </a>
            </dd>
            <dt className="text-center lg:text-left text-base lg:text-sm">
              Facebook
            </dt>
            <dd className="text-center lg:text-right mb-4 lg:mb-0">
              <a
                href="https://www.facebook.com/loveisnoiselr"
                className="underline hover:text-white transition"
              >
                facebook.com/loveisnoiselr
              </a>
            </dd>
            <dt className="text-center lg:text-left text-base lg:text-sm">
              Instagram
            </dt>
            <dd className="text-center lg:text-right mb-4 lg:mb-0">
              <a
                href="https://www.instagram.com/loveisnoiselr/"
                className="underline hover:text-white transition"
              >
                instagram.com/loveisnoiselr
              </a>
            </dd>
            <dt className="text-center lg:text-left text-base lg:text-sm">
              Reddit
            </dt>
            <dd className="text-center lg:text-right mb-4 lg:mb-0">
              <a
                href="https://www.reddit.com/r/loveisnoise/"
                className="underline hover:text-white transition"
              >
                reddit.com/r/loveisnoise/
              </a>
            </dd>
          </dl>
        </div>
      </motion.div>
    </Page>
  )
}
