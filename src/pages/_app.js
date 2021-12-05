import Head from 'next/head'
import 'tailwindcss/tailwind.css'
import '~/css/main.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#feea14" />
        <meta name="msapplication-TileColor" content="#feea14" />
        <meta name="theme-color" content="#feea14" />
        <link rel="stylesheet" href="https://use.typekit.net/gdb2xdd.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
