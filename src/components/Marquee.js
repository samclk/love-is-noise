import FastMarquee from 'react-fast-marquee'
import Image from 'next/image'

const Marquee = () => {
  return (
    <div className="bg-[#faf038] text-black relative z-10">
      <FastMarquee speed={50} gradient={false}>
        <a
          href="https://loveisnoise.lnk.to/toliveinadifferentway"
          target="_blank"
          rel="noopener"
          className="py-2 inline-flex items-center space-x-4 mr-4"
        >
          <span className="font-bold">
            TO LIVE IN A DIFFERENT WAY - <em>AVAILABLE EVERYWHERE NOW</em>
          </span>
          <Image
            src="/img/album.jpg"
            alt="To Live In A Different Way Album Artwork"
            width={40}
            height={40}
            className="size-5 border border-black"
          />
          <span className="font-bold">
            TO LIVE IN A DIFFERENT WAY - <em>AVAILABLE EVERYWHERE NOW</em>
          </span>
          <Image
            src="/img/album.jpg"
            alt="To Live In A Different Way Album Artwork"
            width={40}
            height={40}
            className="size-5 border border-black"
          />
          <span className="font-bold">
            TO LIVE IN A DIFFERENT WAY - <em>AVAILABLE EVERYWHERE NOW</em>
          </span>
          <Image
            src="/img/album.jpg"
            alt="To Live In A Different Way Album Artwork"
            width={40}
            height={40}
            className="size-5 border border-black"
          />
          <span className="font-bold">
            TO LIVE IN A DIFFERENT WAY - <em>AVAILABLE EVERYWHERE NOW</em>
          </span>
          <Image
            src="/img/album.jpg"
            alt="To Live In A Different Way Album Artwork"
            width={40}
            height={40}
            className="size-5 border border-black"
          />
        </a>
      </FastMarquee>
    </div>
  )
}

export default Marquee
