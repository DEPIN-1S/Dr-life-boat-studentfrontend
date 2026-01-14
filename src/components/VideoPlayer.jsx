
import React, { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels'
import 'videojs-http-source-selector'
import './VideoPlayer.css'

const VideoPlayer = ({ src, title }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) return

    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'metadata',
      sources: [{ src, type: 'video/mp4' }],
      html5: { vhs: { overrideNative: true } },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'fullscreenToggle'
        ]
      }
    })

    playerRef.current = player

    // Custom Buttons
    const addButton = (name, text, icon, callback, position) => {
      const Button = videojs.getComponent('Button')
      const btn = videojs.extend(Button, {
        constructor: function() { Button.apply(this, arguments); this.controlText(text); },
        handleClick: callback,
        buildCSSClass: () => `vjs-control vjs-button ${icon}`
      })
      videojs.registerComponent(name, btn)
      player.getChild('controlBar').addChild(name, {}, position)
    }

    addButton('Rewind10', 'Rewind 10s', 'vjs-icon-replay-10', () => {
      player.currentTime(Math.max(0, player.currentTime() - 10))
    }, 1)

    addButton('Forward10', 'Forward 10s', 'vjs-icon-forward-10', () => {
      player.currentTime(Math.min(player.duration(), player.currentTime() + 10))
    }, 2)

    addButton('Speed1x', '1x Speed', 'vjs-speed-btn', () => player.playbackRate(1), 10)
    addButton('Speed2x', '2x Speed', 'vjs-speed-btn', () => player.playbackRate(2), 11)
    addButton('Speed3x', '3x Speed', 'vjs-speed-btn', () => player.playbackRate(3), 12)

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src])

  return (
    <div data-vjs-player className="video-player-container">
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
    </div>
  )
}

export default VideoPlayer
