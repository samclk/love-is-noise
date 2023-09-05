import Head from 'next/head'
import Countdown from 'react-countdown'

const date = '2023-09-06T18:00:00+0100'
const youtubeId = 'P4XJlCu6Zm0'

const YouTubeCountdown = () => {
  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </Head>
      <div className="max-w-2xl mx-auto mb-8">
        <Countdown
          date={new Date(date)}
          className="text-[15vw] sm:text-[10vw] md:sm:text-[7.5vw] font-black uppercase text-white text-opacity-90"
        >
          <div className="aspect-w-16 aspect-h-9 bg-black shadow">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Countdown>
      </div>
    </>
  )
}

export default YouTubeCountdown
