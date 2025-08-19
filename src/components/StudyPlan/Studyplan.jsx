import React, { useState, useEffect } from 'react'
import './studyPlan.css'

const StudyPlan = () => {
  const [studyPlan, setStudyPlan] = useState([])
  const totalVideos = 20
  const videosPerDay = 3

  useEffect(() => {
    generatePlan()
  }, [])

  const generatePlan = () => {
    const plan = []
    let currentDate = new Date()
    let videoCount = 1

    while (videoCount <= totalVideos) {
      const endVideo = Math.min(videoCount + videosPerDay - 1, totalVideos)
      const formattedDate = currentDate.toISOString()?.split('T')[0] // yyyy-mm-dd

      plan.push({
        date: formattedDate,
        videos: `Video ${videoCount} - ${endVideo}`,
      })

      videoCount = endVideo + 1
      currentDate.setDate(currentDate.getDate() + 1) // Next day
    }

    setStudyPlan(plan)
  }

  return (
    <div className="study-plan">
      <h2>Study Plan</h2>
      <ul>
        {studyPlan.map((day, index) => (
          <li key={index} className="study-day">
            <strong>
              Day {index + 1} ({day.date}):
            </strong>{' '}
            {day.videos}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StudyPlan
