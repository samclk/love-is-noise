import Head from 'next/head'

const BandsInTown = () => {
  return (
    <>
      <Head>
        <link rel="dns-prefetch" href="https://widgetv3.bandsintown.com" />
        <script
          src="https://widgetv3.bandsintown.com/main.min.js"
          async
          defer
        />
      </Head>
      <div className="mb-16 mt-16 md:mt-0 uppercase">
        <a
          className="bit-widget-initializer"
          data-artist-name="id_245374"
          data-background-color="rgba(0, 0, 0, 0)"
          data-separator-color="rgba(255, 255, 255, .2)"
          data-text-color="#FFFFFF"
          data-font="neue-haas-grotesk-display"
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
          data-event-ticket-cta-text-color="#000000"
          data-event-ticket-cta-bg-color="#faf038"
          data-event-ticket-cta-border-color="#faf038"
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
    </>
  )
}

export default BandsInTown
