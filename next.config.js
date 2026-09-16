/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev badge's default corner is the one the play button lives in, and it
  // sits above it: in dev the button looks present and swallows every click.
  devIndicators: { position: 'bottom-right' }
}

module.exports = nextConfig
