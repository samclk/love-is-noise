'use client'

import YouTube from 'react-youtube'

export default function Youtube({ videoId }: { videoId: string }) {
  return (
    <div className="relative">
      <YouTube
        videoId={videoId}
        className="aspect-video"
        opts={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
