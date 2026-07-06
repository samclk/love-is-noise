import Link from 'next/link'

type ButtonProps = {
  href?: string
  label: string
  message?: string
}

const sharedClassName = 'block text-center py-4 px-8 text-white'

const sharedStyle: React.CSSProperties = {
  border: '3px solid transparent' /* must set border width */,
  borderImageSource: 'url(/img/barbed-wire.png)' /* your image */,
  borderImageSlice: '160' /* depends on your image */,
  borderImageRepeat: 'repeat' /* repeats evenly */,
  borderImageWidth: 10 /* same as border width */,
  display: 'block'
}

export const Button = ({ href, label, message }: ButtonProps) => {
  const content = (
    <span className="block text-2xl whitespace-nowrap font-styled">
      {label}
    </span>
  )

  return (
    <div className="text-center">
      {href ? (
        <Link
          href={href}
          target="_blank"
          className={sharedClassName}
          style={sharedStyle}
        >
          {content}
        </Link>
      ) : (
        <div className={sharedClassName} style={sharedStyle}>
          {content}
        </div>
      )}
      {message && <p className='text-white text-xs leading-none'>{message}</p>}
    </div>
  )
}
