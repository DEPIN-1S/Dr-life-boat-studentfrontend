import React, { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels'
import 'videojs-http-source-selector'
import './VideoPlayer.css'

import httpSourceSelector from 'videojs-http-source-selector'
videojs.registerPlugin('httpSourceSelector', httpSourceSelector)

const VideoPlayer = ({ videoSources }) => {
  const videoNode = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (videoNode.current && !playerRef.current) {
      const player = videojs(videoNode.current, {
        controls: true,
        autoplay: false,
        responsive: true,
        fluid: true,
        controlBar: {
          children: [
            'playToggle',
            'currentTimeDisplay',
            'progressControl',
            'durationDisplay',
            'volumePanel',
            'qualitySelector',
            'fullscreenToggle',
          ],
        },
        sources: videoSources,
      })

      playerRef.current = player

      class RewindButton extends videojs.getComponent('Button') {
        constructor(player, options) {
          super(player, options)
          this.controlText('Rewind 10 seconds')
        }
        handleClick() {
          const time = player.currentTime()
          player.currentTime(Math.max(0, time - 10))
        }
        buildCSSClass() {
          return 'vjs-control vjs-button vjs-icon-replay'
        }
      }

      class ForwardButton extends videojs.getComponent('Button') {
        constructor(player, options) {
          super(player, options)
          this.controlText('Forward 10 seconds')
        }
        handleClick() {
          const time = player.currentTime()
          player.currentTime(Math.min(player.duration(), time + 10))
        }
        buildCSSClass() {
          return 'vjs-control vjs-button vjs-icon-forward'
        }
      }

      class Speed2xButton extends videojs.getComponent('Button') {
        constructor(player, options) {
          super(player, options)
          this.controlText('2x Speed')
        }
        handleClick() {
          player.playbackRate(2.0)
        }
        buildCSSClass() {
          return 'vjs-control vjs-button speed-2x-btn'
        }
      }

      class Speed3xButton extends videojs.getComponent('Button') {
        constructor(player, options) {
          super(player, options)
          this.controlText('3x Speed')
        }
        handleClick() {
          player.playbackRate(3.0)
        }
        buildCSSClass() {
          return 'vjs-control vjs-button speed-3x-btn'
        }
      }

      class SpeedNormalButton extends videojs.getComponent('Button') {
        constructor(player, options) {
          super(player, options)
          this.controlText('Normal Speed')
        }
        handleClick() {
          player.playbackRate(1.0)
        }
        buildCSSClass() {
          return 'vjs-control vjs-button speed-1x-btn'
        }
      }

      videojs.registerComponent('RewindButton', RewindButton)
      videojs.registerComponent('ForwardButton', ForwardButton)
      videojs.registerComponent('Speed2xButton', Speed2xButton)
      videojs.registerComponent('Speed3xButton', Speed3xButton)
      videojs.registerComponent('SpeedNormalButton', SpeedNormalButton)

      const controlBar = player.getChild('controlBar')
      controlBar.addChild('RewindButton', {}, 1)
      controlBar.addChild('ForwardButton', {}, 2)
      controlBar.addChild('SpeedNormalButton', {}, 3)
      controlBar.addChild('Speed2xButton', {}, 4)
      controlBar.addChild('Speed3xButton', {}, 5)

      // Quality levels
      player.qualityLevels()
      player.httpSourceSelector({ default: 'auto' })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [videoSources])

  return (
    <div data-vjs-player>
      <video ref={videoNode} className="video-js vjs-big-play-centered" />
    </div>
  )
}

export default VideoPlayer
