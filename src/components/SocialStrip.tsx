import {
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaYoutube,
  FaDiscord
} from 'react-icons/fa'
import Link from 'next/link'

const socialLinks = [
  {
    label: 'instagram',
    href: 'https://www.instagram.com/loveisnoiselr/',
    icon: <FaInstagram />
  },
  {
    label: 'spotify',
    href: 'https://open.spotify.com/artist/4qY6XGFQwZubu0oKBJeVki?si=G5Kl2J03SFmejf1QeOuYaQ',
    icon: <FaSpotify />
  },
  {
    label: 'tiktok',
    href: 'https://www.tiktok.com/@loveisnoiselr/',
    icon: <FaTiktok />
  },
  {
    label: 'youtube',
    href: 'https://www.youtube.com/@loveisnoiselr/',
    icon: <FaYoutube />
  },
  {
    label: 'discord',
    href: 'https://discord.gg/skHFhyZKc2',
    icon: <FaDiscord />
  }
]

export const SocialStrip = () => {
  return (
    <div className="flex py-4 justify-center gap-4">
      {socialLinks.map((link) => (
        <Link
          href={link.href}
          target="_blank"
          className="text-3xl block border-2 border-transparent hover:border-white transition-all duration-300  text-white p-2  rounded-full"
          key={link.label}
        >
          {link.icon}
        </Link>
      ))}
    </div>
  )
}
