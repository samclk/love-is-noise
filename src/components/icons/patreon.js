import * as React from 'react'

function Patreon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <g transform="translate(2 2)">
        <circle
          cx={22}
          cy={22}
          r={22}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
        />
        <path
          d="M22.001 14.066a7.935 7.935 0 00-7.935 7.935v10.324h3.175V22.009a4.744 4.744 0 112.148 3.971v3.41a6.769 6.769 0 002.978.536A7.934 7.934 0 0022 14.066zm-.333 15.861c.11 0 .221.008.333.008s.234 0 .349-.008z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

const MemoPatreon = React.memo(Patreon)
export default MemoPatreon
