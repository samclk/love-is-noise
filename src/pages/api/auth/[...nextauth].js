import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Example: hardcoded user
        if (
          credentials.username === 'loveisnoiselr' &&
          credentials.password === 'epkenter'
        ) {
          return { id: 1, name: 'Admin', email: 'admin@example.com' }
        }

        return null // invalid login
      }
    })
  ],
  pages: {
    signIn: '/login' // optional: custom login page
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect here after successful login
      return `${baseUrl}/epk`
    }
  }
}

export default NextAuth(authOptions)
