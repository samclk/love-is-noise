import image from 'next/image'
import Link from 'next/link'

type ButtonProps = {
  href: string
  label: string
}

export const Button = ({ href, label }: ButtonProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      className="block text-center py-4 px-8 text-white"
      style={{
        border: '20px solid transparent' /* must set border width */,
        borderImageSource: 'url(/img/barbed-wire.png)' /* your image */,
        borderImageSlice: '160' /* depends on your image */,
        borderImageRepeat: 'repeat' /* repeats evenly */,
        borderImageWidth: 20 /* same as border width */,
        display: 'inline-block'
      }}
    >
      <span className="block lg:text-5xl text-3xl whitespace-nowrap font-styled">
        {label}
      </span>
    </Link>
  )
}
