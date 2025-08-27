import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTachometerAlt,
  faUser,
  faGraduationCap,
  faBookmark,
  faKeyboard,
  faShoppingCart,
  faQuestionCircle,
  faCog,
  faSignOutAlt,
  faBookOpen,
  faQuestion,
  faBook,
} from '@fortawesome/free-solid-svg-icons'
import { FaChartBar } from 'react-icons/fa'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <FontAwesomeIcon icon={faTachometerAlt} className="me-3" />,
  },
  {
    component: CNavItem,
    name: 'Courses',
    to: '/courses',
    icon: <FontAwesomeIcon icon={faBookOpen} className="me-3" />,
  },
  {
    component: CNavItem,
    name: 'Enrolled',
    to: '/enrolled-courses',
    icon: <FontAwesomeIcon icon={faGraduationCap} className="me-3" />,
  },
  {
    component: CNavGroup,
    name: 'Exam',
    to: '/exam',
    icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
    items: [
      {
        component: CNavItem,
        name: 'Exams',
        to: '/exam-view', // Match ExamQuestion route
        icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
      },
      {
        component: CNavItem,
        name: 'Result',
        to: '/exam/result', // Base path, dynamic :examId handled by route
        icon: <FaChartBar className="me-3" />,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/logout',
    icon: <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />,
  },
]

export default _nav
