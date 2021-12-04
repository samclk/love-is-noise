import * as React from 'react'

function Twitter(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <g transform="translate(2 2)">
        <path fill="none" d="M0 0h44v44H0z" />
        <circle
          cx={22}
          cy={22}
          r={22}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
        />
        <path
          d="M30.526 16.846a4.51 4.51 0 001.893-2.513 8.355 8.355 0 01-2.736 1.1A4.194 4.194 0 0026.539 14a4.43 4.43 0 00-4.307 4.544 4.757 4.757 0 00.11 1.035 12.033 12.033 0 01-8.88-4.748 4.724 4.724 0 00-.583 2.285A4.616 4.616 0 0014.8 20.9a4.154 4.154 0 01-1.953-.568v.056a4.489 4.489 0 003.453 4.454 4.114 4.114 0 01-1.946.079 4.346 4.346 0 004.024 3.155 8.364 8.364 0 01-5.351 1.945A8.137 8.137 0 0112 29.959 11.748 11.748 0 0018.6 32c7.926 0 12.257-6.924 12.257-12.929 0-.2 0-.394-.011-.588A9.005 9.005 0 0033 16.131a8.257 8.257 0 01-2.474.715z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  )
}

const MemoTwitter = React.memo(Twitter)
export default MemoTwitter
