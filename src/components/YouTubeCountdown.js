import { motion } from 'framer-motion'
import Head from 'next/head'
import Countdown from 'react-countdown'

const date = '2024-06-05T18:00:00+0100'
const youtubeId = 'Ub8a_tKZbBc'

const YouTubeCountdown = () => {
  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </Head>
      <div className="max-w-2xl mx-auto mb-8">
        <Countdown
          date={new Date(date)}
          className="text-[15vw] sm:text-[10vw] md:text-[7.5vw] lg:text-[120px] font-black uppercase text-white text-opacity-90"
        >
          <>
            <div className="aspect-w-16 aspect-h-9 bg-black shadow">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-0 mt-4 drop-shadow">
              Love is Noise
            </h1>
            <span className="block text-3xl sm:text-4xl md:text-5xl m-0 drop-shadow">
              Jawbreaker
            </span>
            <div className="flex justify-center gap-4 mt-6">
              <motion.a
                whileHover={{ backgroundColor: '#ffbc17' }}
                whileTap={{ backgroundColor: '#ffca4a', scale: 0.95 }}
                className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-[#ffc330] text-black leading-none lg:text-lg italic shadow"
                href="https://loveisnoise.bigcartel.com/products"
                target="_blank"
                rel="noopener"
              >
                Shop merch
              </motion.a>
              {/* <MotionLink
              href="/gallery"
              whileHover={{ borderColor: '#ffbc17' }}
              whileTap={{
                borderColor: '#ffca4a',
                scale: 0.95,
                color: '#ffca4a'
              }}
              className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 border-2 text-white leading-none lg:text-lg italic shadow"
            >
              View BTS
            </MotionLink> */}
            </div>
          </>
        </Countdown>
      </div>
    </>
  )
}

export default YouTubeCountdown
