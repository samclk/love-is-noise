import { motion } from 'framer-motion'
import Head from 'next/head'
import Image from 'next/image'
import Countdown from 'react-countdown'

const date = '2024-09-05T10:00:00+0100'
const youtubeId = 'b9Ph1u-K27k'

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
              TO LIVE IN A DIFFERENT WAY
            </span>
            <Image
              src="/img/album.jpg"
              alt="To Live In A Different Way Album Artwork"
              width={400}
              height={400}
              className="w-60 h-60 mx-auto mt-6"
            />
            <p className="text-center text-xl mt-6 text-pretty">
              Preorders available 25th October
            </p>
            {/* <div className="flex justify-center gap-4 mt-6">
              <motion.a
                whileHover={{ backgroundColor: '#faf038' }}
                whileTap={{ backgroundColor: '#bdb405', scale: 0.95 }}
                className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-[#f9ec0d] text-black leading-none lg:text-lg italic shadow"
                href="https://loveisnoise.bigcartel.com/products"
                target="_blank"
                rel="noopener"
              >
                Shop merch
              </motion.a>
            </div> */}
          </>
        </Countdown>
      </div>
    </>
  )
}

export default YouTubeCountdown
