
import React, { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels'
import 'videojs-http-source-selector'
import './VideoPlayer.css'

const VideoPlayer = ({ src, title }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  // Use a key based on src to force full re-mount of player when URL changes
  // This is vital for pre-signed URLs because they have unique signatures every time
  const playerKey = React.useMemo(() => src ? src.split('?')[0] : 'none', [src]);

  useEffect(() => {
    if (!videoRef.current || !src) return

    const getMimetype = (url) => {
      if (typeof url !== 'string') return 'video/mp4'
      const cleanUrl = url.split('?')[0].toLowerCase()
      if (cleanUrl.endsWith('.m3u8')) return 'application/x-mpegURL'
      if (cleanUrl.endsWith('.webm')) return 'video/webm'
      return 'video/mp4'
    }

    const type = getMimetype(src)
    
    // Initialize VideoJS
    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'auto',
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2, 3],
      sources: [{ src, type }]
    })

    playerRef.current = player

    player.on('error', () => {
      console.error('VideoJS Error:', player.error())
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src])

  if (!src) return <div className="p-5 text-center text-white">Loading video...</div>

  return (
    <div 
      key={playerKey}
      data-vjs-player 
      className="video-player-container h-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
        preload="auto"
        controlsList="nodownload"
      />
    </div>
  )
}

export default VideoPlayer
