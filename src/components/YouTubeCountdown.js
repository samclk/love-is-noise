import { motion } from 'motion/react'
import Head from 'next/head'
import Countdown from 'react-countdown'

const date = '2024-09-05T10:00:00+0100'
const youtubeId = 'SgcDGfiFGcM'

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-0 mt-4 sm:mt-8 drop-shadow">
              Love is Noise
            </h1>
            <span className="block text-xl sm:text-2xl md:text-3xl m-0 drop-shadow">
              hole in me
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl mb-4 m-0 drop-shadow">
              the new single
            </span>
            <p className="text-center text-xl mt-2 text-pretty italic">
              AVAILABLE EVERYWHERE NOW
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <motion.a
                whileHover={{ backgroundColor: '#faf038' }}
                whileTap={{ backgroundColor: '#bdb405', scale: 0.95 }}
                className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-[#f9ec0d] text-black leading-none lg:text-2xl italic shadow"
                href="https://loveisnoise.lnk.to/toliveinadifferentway"
                target="_blank"
                rel="noopener"
              >
                Listen
              </motion.a>
            </div>
          </>
        </Countdown>
      </div>
    </>
  )
}

export default YouTubeCountdown
