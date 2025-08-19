import React, { useState } from 'react'
import './Overview.css'
import { FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa'

const Overview = ({ data }) => {
  const [showBenefits, setShowBenefits] = useState(true)
  const [showLearn, setShowLearn] = useState(true)

  const course_benefit = React.useMemo(() => {
    try {
      return data?.course_benifits ? data.course_benifits : []
    } catch (e) {
      console.error('Error parsing course_benifits:', e)
      return []
    }
  }, [data])
  const course_learns = React.useMemo(() => {
    try {
      return data?.learn_from_course ? data.learn_from_course : []
    } catch (e) {
      console.error('Error parsing course_benifits:', e)
      return []
    }
  }, [data])
  const Desc_list = React.useMemo(() => {
    try {
      return data?.list_description ? JSON.parse(data.list_description) : []
    } catch (e) {
      console.error('Error parsing course_benifits:', e)
      return []
    }
  }, [data])

  return (
    <div className="overview-container">
      <section className="section">
        <h4 className="section-title">About Course</h4>
        <p className="section-description">{data?.about}</p>
        <ul className="benefits-list">
          {Desc_list?.map((desc) => (
            <li className="fontsize">{desc}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h4 className="section-title">Premium Course Highlights</h4>
        {showBenefits && (
          <ul className="benefits-list">
            {course_benefit.map((benfits) => (
              <li className="fontsize">
                {/* <FaCheckCircle className="icon gold" /> */}
                {benfits}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setShowBenefits(!showBenefits)} className="toggle-btn">
          {showBenefits ? 'Show less' : 'Show more'}{' '}
          {showBenefits ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </section>

      <section className="section">
        <h4 className="section-title">What you’ll learn in this course</h4>
        {showLearn && (
          <ul className="learn-list">
            {course_learns?.map((learns) => (
              <li className="fontsize">
                <FaCheckCircle className="icon green" /> {learns}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setShowLearn(!showLearn)} className="toggle-btn">
          {showLearn ? 'Show less' : 'Show more'} {showLearn ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </section>

      {/* Instructor */}
      <section className="section instructor-section">
        <h4 className="section-title">Instructor</h4>
        <div className="instructor-info">
          <div className="instructor-logo">MEDU</div>
          <div>
            <strong>{data?.instructor_name}</strong>
            <div className="ratings">
              <div>4.8 Ratings</div>
              <div>350 Reviews</div>
              <div>5 Courses</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Overview
