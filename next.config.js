/** @type {import('next').NextConfig} */
const nextConfig = {
  // The listen route reads the encrypted track from disk, which Next's tracing
  // cannot see from a computed path, so it is bundled explicitly.
  outputFileTracingIncludes: {
    '/api/listen': ['./private/**']
  }
}

module.exports = nextConfig
