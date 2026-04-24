
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
    if (!videoRef.current || !src) return

    // Determine MIME type based on extension
    const getMimetype = (url) => {
      console.log("VideoPlayer: Loading URL:", url);
      if (typeof url !== 'string') return 'video/mp4'
      const cleanUrl = url.split('?')[0].toLowerCase()
      if (cleanUrl.endsWith('.m3u8')) return 'application/x-mpegURL'
      if (cleanUrl.endsWith('.webm')) return 'video/webm'
      if (cleanUrl.endsWith('.ogg')) return 'video/ogg'
      if (cleanUrl.endsWith('.mov')) return 'video/quicktime'
      if (cleanUrl.endsWith('.mkv')) return 'video/x-matroska'
      if (cleanUrl.endsWith('.avi')) return 'video/x-msvideo'
      if (cleanUrl.endsWith('.wmv')) return 'video/x-ms-wmv'
      return 'video/mp4'
    }

    const type = getMimetype(src)
    console.log(`VideoPlayer: Loading ${type} from ${src}`)

    const player = videojs(videoRef.current, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'metadata',
      sources: [{ src, type }],
      // Only use VHS/HLS override if it's actually an HLS stream
      html5: { 
        vhs: { 
          overrideNative: type === 'application/x-mpegURL' 
        } 
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'qualitySelector', // Add quality selector if HLS
          'fullscreenToggle'
        ]
      }
    })

    playerRef.current = player

    // Error handling
    player.on('error', () => {
      const error = player.error()
      console.error('VideoJS Error:', error.code, error.message)
    })

    // Initialize plugins if available
    if (player.qualityLevels) {
      player.qualityLevels()
    }
    if (player.httpSourceSelector) {
      player.httpSourceSelector()
    }

    // Custom Buttons
    const addButton = (name, text, icon, callback, position) => {
      const Button = videojs.getComponent('Button');
      class CustomButton extends Button {
        constructor(player, options) {
          super(player, options);
          this.controlText(text);
        }
        handleClick() {
          callback();
        }
        buildCSSClass() {
          return `vjs-control vjs-button ${icon}`;
        }
      }
      videojs.registerComponent(name, CustomButton);
      player.getChild('controlBar').addChild(name, {}, position);
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
    <div data-vjs-player className="video-player-container h-100">
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
    </div>
  )
}

export default VideoPlayer
