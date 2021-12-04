import * as React from 'react'

function Facebook(props) {
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
          d="M23.315 35h-4.878V23.5H16v-3.965h2.437v-2.379c0-3.233 1.375-5.156 5.286-5.156h3.255v3.965h-2.034c-1.522 0-1.623.554-1.623 1.587l-.007 1.984H27l-.431 3.964h-3.255V35z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
    </svg>
  )
}

const MemoFacebook = React.memo(Facebook)
export default MemoFacebook
