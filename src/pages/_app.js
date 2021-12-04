import Head from 'next/head'
import 'tailwindcss/tailwind.css'
import '~/css/main.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/gdb2xdd.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
