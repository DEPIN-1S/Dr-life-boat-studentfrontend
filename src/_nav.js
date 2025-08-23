// import React from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//   faTachometerAlt,
//   faUser,
//   faGraduationCap,
//   faBookmark,
//   faKeyboard,
//   faShoppingCart,
//   faQuestionCircle,
//   faCog,
//   faSignOutAlt,
//   faBookOpen,
//   faQuestion,
//   faBook,
//   // Added for Courses
// } from '@fortawesome/free-solid-svg-icons'

// import { CNavGroup, CNavItem } from '@coreui/react'
// import { FaBook, faChartBar } from 'react-icons/fa'

// const _nav = [
//   {
//     component: CNavItem,
//     name: 'Dashboard',
//     to: '/dashboard',
//     icon: <FontAwesomeIcon icon={faTachometerAlt} className="me-3" />,
//   },
//   // {
//   //   component: CNavItem,
//   //   name: 'My Profile',
//   //   to: '/scheduled',
//   //   icon: <FontAwesomeIcon icon={faUser} className="me-3" />,
//   // },
//   {
//     component: CNavItem,
//     name: 'Courses',
//     to: '/courses',
//     icon: <FontAwesomeIcon icon={faBookOpen} className="me-3" />,
//   },
//   {
//     component: CNavItem,
//     name: 'Enrolled',
//     to: '/enrolled-courses',
//     icon: <FontAwesomeIcon icon={faGraduationCap} className="me-3" />,
//   },
//   // {
//   //   component: CNavItem,
//   //   name: 'Wishlist',
//   //   to: '/enquiry-form',
//   //   icon: <FontAwesomeIcon icon={faBookmark} className="me-3" />,
//   // },
//   // {
//   //   component: CNavItem,
//   //   name: 'My Quiz Attempts',
//   //   to: '/enquiry-form',
//   //   icon: <FontAwesomeIcon icon={faKeyboard} className="me-3" />,
//   // },
//   // {
//   //   component: CNavItem,
//   //   name: 'Order History',
//   //   to: '/enquiry-form',
//   //   icon: <FontAwesomeIcon icon={faShoppingCart} className="me-3" />,
//   // },
//   // {
//   //   component: CNavItem,
//   //   name: 'Question & Answers',
//   //   to: '/enquiry-form',
//   //   icon: <FontAwesomeIcon icon={faQuestionCircle} className="me-3" />,
//   // },

//   // {
//   //   component: CNavItem,
//   //   name: 'Settings',
//   //   to: '/enquiry-form',
//   //   icon: <FontAwesomeIcon icon={faCog} className="me-3" />,
//   // },
//   // {
//   //   component: CNavItem,
//   //   name: 'Exam',
//   //   to: '/Exam',
//   //   icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
//   // },

//   {
//     component: CNavGroup, // Changed to CNavGroup for dropdown
//     name: 'Exam',
//     to: '/exam',
//     icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
//     items: [
//       {
//         component: CNavItem,
//         name: 'Take Exam',
//         to: '/exam/take',
//         icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
//       },
//       {
//         component: CNavItem,
//         name: 'Result',
//         to: '/exam/result',
//         icon: <FontAwesomeIcon icon={faChartBar} className="me-3" />,
//       },
//     ],
//   },

//   {
//     component: CNavItem,
//     name: 'Logout',
//     to: '/',
//     icon: <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />,
//   },
// ]

// export default _nav



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
import { FaChartBar } from 'react-icons/fa' // Import from react-icons
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
        to: '/Exam',
        icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
      },
      {
        component: CNavItem,
        name: 'Result',
        to: '/Exam/result',
        icon: <FaChartBar className="me-3" />, // Use FaChartBar directly
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Logout',
    to: '/',
    icon: <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />,
  },
]

export default _nav
