import React, { useState } from 'react'
import './TestInstructions.css'
import { useLocation, useNavigate } from 'react-router-dom'

const TestInstructions = () => {
  const navigation = useNavigate()
  const data = useLocation()
  const [checked, setChecked] = useState(false)

  return (
    <div className="test-fullscreen">
      <div className="test-content">
        <h2 className="test-title">{data.state.ex_name}</h2>

        <div className="test-info">
          <p>
            No of Questions: <strong>{data.state.ex_total_questions}</strong>
          </p>
          <p>
            Duration: <strong>{data.state.ex_duration} Minutes</strong>
          </p>
        </div>

        {/* <h3 className="instructions-title">Important Instructions</h3>
        <ul className="instructions-list">
          <li>4 marks for each correct answer and negative 1 for each incorrect answer.</li>
          <li>You can skip questions if you do not want to attend.</li>
          <li>In last question you can finish quiz after confirmation.</li>
          <li>If time expires, the quiz will be automatically submitted without confirmation.</li>
        </ul> */}

        {/* ✅ NEW EXTENDED CONTENT STARTS HERE */}
        <div className="detailed-instructions">
          <h3>Please read the instructions carefully</h3>

          <h4>General Instructions:</h4>
          <ol>
            <li>
              Total duration of mock sample questions is{' '}
              <strong>{data.state.ex_duration} minutes</strong>.
            </li>
            <li>
              The clock will be set at the server and the countdown timer at the top-center of the
              screen will display the remaining time available. When the timer reaches zero, the
              examination will end automatically.
            </li>
            <li>
              The Question Palette displayed on the right side will show the status of each question
              using symbols.
            </li>
            <li>
              The <em>Marked for Review</em> status indicates you want to revisit the question. If
              an answer is selected for a Marked for Review question, it will be considered in the
              final evaluation.
            </li>
          </ol>

          <h4>Navigating to a Question:</h4>
          <ol start={5}>
            <li>
              To answer a question:
              <ul>
                <li>
                  Click the question number in the Question Palette to go directly to it (note: this
                  does NOT save your current answer).
                </li>
                <li>
                  Click <strong>Save & Next</strong> to save your answer and move to the next
                  question.
                </li>
                <li>
                  Click <strong>Mark for Review & Next</strong> to mark the question for review and
                  move on.
                </li>
              </ul>
            </li>
            <li>
              You can view the entire paper by clicking the <strong>Question Paper</strong> button
              (top-right).
            </li>
            <li>
              If unclear about the instructions, click the <strong>Instructions</strong> button next
              to Question Paper.
            </li>
          </ol>

          <h4>Answering a Question:</h4>
          <ol start={8}>
            <li>
              For multiple-choice questions:
              <ul>
                <li>Click an option to select it.</li>
                <li>
                  Click again or click <strong>Clear Response</strong> to deselect.
                </li>
                <li>To change your answer, click another option.</li>
                <li>
                  To save your answer, you MUST click <strong>Save & Next</strong>.
                </li>
                <li>
                  To mark for review, click <strong>Mark for Review & Next</strong>. (Marked answers
                  are still evaluated.)
                </li>
              </ul>
            </li>
            <li>
              To change an already answered question, navigate to it and follow the same process.
            </li>
            <li>Only saved answers will be considered for evaluation.</li>
          </ol>

          <h4>Section-wise Categorisation:</h4>
          <ol start={11}>
            <li>If multiple sections exist, they will appear as headers at the top.</li>
            <ul>
              <li>
                You can jump to any section and it will take you to the first question of that
                section.
              </li>
              <li>
                Hover on the info (i) icon to see how many questions are answered, unanswered,
                marked for review, etc.
              </li>
              <li>If there are no sections, only the questions list will appear.</li>
            </ul>
          </ol>

          <h4>Instructions for Mock Test:</h4>
          <ol>
            <li>
              This is a Mock test for practice only. Do not assume it reflects actual exam
              questions.
            </li>
            <li>
              The mock test is only for familiarizing yourself with the system, not actual content.
            </li>
          </ol>

          <h4>Important Exam Rules:</h4>
          <ul>
            <li>
              Pen, Pencil, Cell phones, pagers, calculators, Pen Drives, Tablets or any electronic
              devices are strictly prohibited. No custody arrangements at exam centers.
            </li>
            <li>Improper conduct will lead to expulsion & cancellation of candidature.</li>
            <li>Follow on-screen instructions carefully during the test.</li>
            <li>
              Use of physical keyboard is prohibited; a virtual keyboard will appear when needed.
            </li>
            <li>Maintain silence and discipline at all times.</li>
            <li>Identity verification may include thumb impression, photograph, or other means.</li>
            <li>Late entry and early exit are not allowed.</li>
            <li>
              Please read the official information bulletin carefully before appearing for the test.
            </li>
          </ul>

          <p className="acknowledgment">
            <input type="checkbox" onClick={() => setChecked(true)} /> I acknowledge that I have
            read and understood the above instructions and agree to comply with the guidelines.
          </p>
        </div>
        {/* ✅ NEW EXTENDED CONTENT ENDS HERE */}

        <button
          className="start-btn"
          disabled={!checked}
          onClick={() => navigation('/exam-view', { state: data.state })}
        >
          Start Now
        </button>
      </div>
    </div>
  )
}
export default TestInstructions
