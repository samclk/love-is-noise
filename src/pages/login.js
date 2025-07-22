// pages/login.js
import { getCsrfToken } from 'next-auth/react'
import Image from 'next/image'
import Head from 'next/head'

export default function Login({ csrfToken }) {
  return (
    <>
      <Head>
        <title>Login | Love Is Noise</title>
        <link rel="canonical" href="https://loveisnoise.world/epk" />
        <meta property="og:title" content="Login | Love Is Noise" />

        <meta property="og:url" content="https://loveisnoise.world/login" />
        <meta property="og:type" content="website" />
      </Head>
      <div className="grid px-8 place-items-center h-screen ">
        <div>
          <Image
            src="/img/logo.png"
            height={200}
            width={400}
            alt="Love Is Noise Logo"
            className="mb-4"
          />
          <p className="mb-8 font-bold text-center">Electronic Press Kit</p>
          <form
            method="post"
            className="flex w-full max-w-md flex-col gap-4 text-black"
            action="/api/auth/callback/credentials"
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <div>
              <input
                name="username"
                className="px-4 py-2 w-full max-w-lg"
                placeholder="Username"
                type="text"
              />
            </div>
            <div>
              <input
                name="password"
                className="px-4 py-2 w-full max-w-lg"
                placeholder="Password"
                type="password"
              />
            </div>

            <button
              className="border text-white border-white font-bold font-sans py-2.5 px-3.5 uppercase"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context)
    }
  }
}
