import { motion } from 'framer-motion'
import Head from 'next/head'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import MemoFacebook from '~/components/icons/facebook'
import MemoInstagram from '~/components/icons/instagram'
import MemoPatreon from '~/components/icons/patreon'
import MemoReddit from '~/components/icons/reddit'

const date = '2023-05-18T18:00:00+0100'

const coreImages = [
  '/img/homepage-bg.jpg',
  '/img/logo-black--super-rough.png',
  '/img/distress.png',
  '/img/logo-new.png'
]

export default function Home() {
  const headerRef = useRef(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  const updateHeaderHeight = () => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
  }

  useLayoutEffect(updateHeaderHeight, [headerRef.current])

  useEffect(() => {
    if (process.browser) {
      window.addEventListener('resize', updateHeaderHeight)

      return () => {
        window.removeEventListener('resize', updateHeaderHeight)
      }
    }
  }, [])

  return (
    <>
      <Head>
        {coreImages.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
        <title>Love Is Noise - In the shadow of your former self.</title>
        <link rel="canonical" href="https://loveisnoise.world" />

        <meta
          property="og:title"
          content="Love Is Noise - In the shadow of your former self."
        />
        <meta
          property="og:description"
          content="In the shadow of your former self."
        />
        <meta property="og:url" content="https://loveisnoise.world" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@whatsamtweets" />
        <meta
          name="twitter:title"
          content="Love Is Noise - In the shadow of your former self."
        />
        <meta
          name="twitter:description"
          content="In the shadow of your former self."
        />
        <meta
          name="twitter:image"
          content="https://firebasestorage.googleapis.com/v0/b/love-is-noise.appspot.com/o/og-euphoria.jpg?alt=media&token=fab43e87-b556-44ff-996e-fa780ae5a587"
        />

        <link rel="dns-prefetch" href="https://www.youtube.com"></link>
        <link rel="dns-prefetch" href="https://widgetv3.bandsintown.com"></link>
        <script
          charSet="utf-8"
          src="https://widgetv3.bandsintown.com/main.min.js"
          async
          defer
        ></script>
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col min-h-screen py-2"
        onAnimationComplete={updateHeaderHeight}
      >
        <motion.img
          src="/img/homepage-bg.jpg"
          className="h-screen w-full fixed inset-0 object-cover"
          initial={{ opacity: 0, filter: 'blur(15px)' }}
          animate={{ opacity: 0.5, filter: 'blur(0px)' }}
          transition={{ duration: 1 }}
          alt=""
        />
        <motion.img
          src="/img/distress.png"
          className="h-screen w-full fixed inset-0 object-cover mix-blend-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          alt=""
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="container mx-auto relative z-10 flex-grow flex flex-col"
        >
          <div
            className="flex justify-center items-center w-full space-x-2 md:space-x-4 drop-shadow"
            ref={headerRef}
          >
            <motion.a
              href="https://www.facebook.com/loveisnoiselr"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoFacebook className="w-8 h-auto" />
            </motion.a>
            <motion.a
              href="https://www.instagram.com/loveisnoiselr/"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoInstagram className="w-8 h-auto" />
            </motion.a>
            <motion.a href="/" whileTap={{ scale: 0.95 }}>
              <img
                src="/img/logo-new.png"
                className="w-52 md:w-64 lg:w-72 h-auto"
              />
            </motion.a>
            <motion.a
              href="https://www.reddit.com/r/loveisnoise/"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoReddit className="w-8 h-auto" />
            </motion.a>
            <motion.a
              href="http://www.patreon.com/loveisnoise"
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MemoPatreon className="w-8 h-auto" />
            </motion.a>
          </div>
          <div
            className="text-center flex-grow flex justify-center flex-col drop-shadow-md font-sans font-bold sm:!pb-0"
            style={{ paddingBottom: headerHeight }}
          >
            <motion.div
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 2.75 }}
              className="text-center font-black uppercase text-white my-8 sm:my-10 lg:my-16 drop-shadow leading"
            >
              <div className="max-w-2xl mx-auto mb-8">
                <Countdown
                  date={new Date(date)}
                  className="text-[15vw] sm:text-[10vw] md:sm:text-[7.5vw] font-black uppercase text-white text-opacity-90"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-black shadow">
                    <iframe
                      src="https://www.youtube.com/embed/y4Lol4E_gk8"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </Countdown>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl m-0">
                Love is Noise
              </h1>
              <span className="block text-3xl sm:text-4xl md:text-5xl m-0">
                In the shadow of your former self.
              </span>
              <motion.a
                whileHover={{ backgroundColor: '#e22d2d' }}
                whileTap={{ backgroundColor: '#e63939', scale: 0.95 }}
                className="mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-red-600 text-white leading-none lg:text-lg italic shadow"
                href="https://loveisnoise.bigcartel.com/products"
                target="_blank"
                rel="noopener"
              >
                Shop merch
              </motion.a>
              <div className="my-16 uppercase">
                <a
                  className="bit-widget-initializer"
                  data-artist-name="id_245374"
                  data-background-color="rgba(0, 0, 0, .1)"
                  data-separator-color="rgba(255, 255, 255, .2)"
                  data-text-color="#FFFFFF"
                  data-font="modesto-condensed"
                  data-auto-style="true"
                  data-button-label-capitalization="uppercase"
                  data-header-capitalization="uppercase"
                  data-location-capitalization="uppercase"
                  data-venue-capitalization="uppercase"
                  data-display-local-dates="true"
                  data-local-dates-position="tab"
                  data-display-past-dates="true"
                  data-display-details="false"
                  data-display-lineup="false"
                  data-display-start-time=""
                  data-social-share-icon="false"
                  data-display-limit="all"
                  data-date-format="DD/MM/YY"
                  data-date-orientation="horizontal"
                  data-date-border-color="rgba(255, 255, 255, .5)"
                  data-date-border-width="1px"
                  data-date-capitalization="undefined"
                  data-date-border-radius="0px"
                  data-event-ticket-cta-size="medium"
                  data-event-custom-ticket-text="undefined"
                  data-event-ticket-text="TICKETS"
                  data-event-ticket-icon=""
                  data-event-ticket-cta-text-color="#FFFFFF"
                  data-event-ticket-cta-bg-color="#dc2626"
                  data-event-ticket-cta-border-color="#dc2626"
                  data-event-ticket-cta-border-width="0px"
                  data-event-ticket-cta-border-radius="0px"
                  data-sold-out-button-text-color="#000000"
                  data-sold-out-button-background-color="rgba(255, 255, 255, .5)"
                  data-sold-out-button-border-color="rgba(255, 255, 255, .5)"
                  data-sold-out-button-clickable="true"
                  data-event-rsvp-position="undefined"
                  data-event-rsvp-cta-size="medium"
                  data-event-rsvp-only-show-icon="undefined"
                  data-event-rsvp-text="REMIND ME"
                  data-event-rsvp-icon=""
                  data-event-rsvp-cta-text-color="#FFFFFF"
                  data-event-rsvp-cta-bg-color="transparent"
                  data-event-rsvp-cta-border-color="#FFFFFF"
                  data-event-rsvp-cta-border-width="1px"
                  data-event-rsvp-cta-border-radius="0px"
                  data-follow-section-position="top"
                  data-follow-section-alignment="center"
                  data-follow-section-header-text="UPCOMING SHOWS"
                  data-follow-section-cta-size="medium"
                  data-follow-section-cta-text="FOLLOW"
                  data-follow-section-cta-icon="true"
                  data-follow-section-cta-text-color="#000000"
                  data-follow-section-cta-bg-color="#FFFFFF"
                  data-follow-section-cta-border-color="#FFFFFF"
                  data-follow-section-cta-border-width="0px"
                  data-follow-section-cta-border-radius="0px"
                  data-play-my-city-position="bottom"
                  data-play-my-city-alignment="Center"
                  data-play-my-city-header-text="Don’t see a show near you?"
                  data-play-my-city-cta-size="medium"
                  data-play-my-city-cta-text="REQUEST A SHOW"
                  data-play-my-city-cta-icon="true"
                  data-play-my-city-cta-text-color="#000000"
                  data-play-my-city-cta-bg-color="#FFFFFF"
                  data-play-my-city-cta-border-color="#FFFFFF"
                  data-play-my-city-cta-border-width="0px"
                  data-play-my-city-cta-border-radius="0px"
                  data-language="en"
                  data-layout-breakpoint="900"
                  data-app-id=""
                  data-affil-code=""
                  data-bit-logo-position="bottomRight"
                  data-bit-logo-color="rgba(255, 255, 255, .75)"
                  data-optin-font="undefined"
                  data-optin-text-color="undefined"
                  data-optin-bg-color="undefined"
                  data-optin-cta-text-color="undefined"
                  data-optin-cta-bg-color="undefined"
                  data-optin-cta-border-width="undefined"
                  data-optin-cta-border-radius="0px"
                  data-optin-cta-border-color="undefined"
                ></a>
              </div>

              {/* Begin Mailchimp Signup Form */}
              <div id="mc_embed_signup">
                <form
                  action="https://world.us12.list-manage.com/subscribe/post?u=5381817b945cf1d237f219562&id=9366de9b6a&f_id=003eb7e0f0"
                  method="post"
                  id="mc-embedded-subscribe-form"
                  name="mc-embedded-subscribe-form"
                  className="validate p-12 mx-auto max-w-lg"
                  target="_self"
                >
                  <div id="mc_embed_signup_scroll">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2">
                      Join the mailing list
                    </h2>
                    <div className="mc-field-group space-x-2">
                      <label htmlFor="mce-EMAIL" className="sr-only">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue=""
                        name="EMAIL"
                        className="required email bg-transparent border-2 border-white text-white p-2 min-w-[200px] text-center w-full"
                        id="mce-EMAIL"
                        required=""
                        placeholder="Email address"
                      />
                      <span id="mce-EMAIL-HELPERTEXT" className="helper_text" />
                    </div>
                    <div id="mce-responses" className="clear foot">
                      <div
                        className="response"
                        id="mce-error-response"
                        style={{ display: 'none' }}
                      />
                      <div
                        className="response"
                        id="mce-success-response"
                        style={{ display: 'none' }}
                      />
                    </div>{' '}
                    {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups*/}
                    <div
                      style={{ position: 'absolute', left: '-5000px' }}
                      aria-hidden="true"
                    >
                      <input
                        type="text"
                        name="b_5381817b945cf1d237f219562_9366de9b6a"
                        tabIndex={-1}
                        defaultValue=""
                      />
                    </div>
                    <div className="optionalParent">
                      <div className="clear foot">
                        <motion.input
                          whileHover={{ backgroundColor: '#e22d2d' }}
                          whileTap={{
                            backgroundColor: '#e63939',
                            scale: 0.95
                          }}
                          className="button mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-red-600 text-white leading-none lg:text-lg italic shadow uppercase"
                          type="submit"
                          defaultValue="Subscribe"
                          name="subscribe"
                          id="mc-embedded-subscribe"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              {/*End mc_embed_signup*/}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
