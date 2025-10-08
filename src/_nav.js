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
// {
//         component: CNavItem,
//         name: 'Results',
//         to: '/exam/result/:seExamId', // List of results (base path for overview; dynamic :seId handled separately for details)
//         icon: <FaChartBar className="me-3" />,
//       },

    // {
    //     component: CNavItem,
    //     name: 'Analytics',
    //     to: '/exam/result',// Base path, dynamic :examId handled by route
    //     icon: <FaChartBar className="me-3" />,
    //   },


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

// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faTachometerAlt,
//   faQuestionCircle,
//   faBook,
//   faChartBar,
//   faPlay,
//   faUser,
//   faGraduationCap,
//   faShoppingCart,
// } from '@fortawesome/free-solid-svg-icons';
// import { CNavGroup, CNavItem } from '@coreui/react';

// const _nav = [
//   {
//     component: CNavItem,
//     name: 'Dashboard',
//     to: '/dashboard',
//     icon: <FontAwesomeIcon icon={faTachometerAlt} className="me-3" />,
//   },
//   // Study Module Section
//   {
//     component: 'divider',
//     name: 'STUDY MODULE',
//     className: 'nav-section-header',
//   },
//   {
//     component: CNavItem,
//     name: 'Qbank',
//     to: '/qbank',
//     icon: <FontAwesomeIcon icon={faQuestionCircle} className="me-3" />,
//     className: 'qbank-active',
//   },
//   {
//     component: CNavGroup,
//     name: 'Test Series',
//     to: '/exam',
//     icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
//     items: [
//       {
//         component: CNavItem,
//         name: 'Exams',
//         to: '/exam-view', // Matches /exam-view in App.js
//         icon: <FontAwesomeIcon icon={faBook} className="me-3" />,
//       },
//       {
//         component: CNavItem,
//         name: 'Results',
//         to: '/submitted-exams', // Link to a page listing submitted exams
//         icon: <FontAwesomeIcon icon={faChartBar} className="me-3" />,
//       },
//     ],
//   },
//   {
//     component: CNavItem,
//     name: 'Analytics',
//     to: '/exam/analysis', // Matches /exam/analysis in App.js
//     icon: <FontAwesomeIcon icon={faChartBar} className="me-3" />,
//   },
//   {
//     component: CNavItem,
//     name: 'Videos',
//     to: '/videos',
//     icon: <FontAwesomeIcon icon={faPlay} className="me-3" />,
//   },
//   // My Account Section
//   {
//     component: 'divider',
//     name: 'MY ACCOUNT',
//     className: 'nav-section-header',
//   },
//   {
//     component: CNavItem,
//     name: 'My Profile',
//     to: '/profile',
//     icon: <FontAwesomeIcon icon={faUser} className="me-3" />,
//   },
//   {
//     component: CNavItem,
//     name: 'Enrolled',
//     to: '/enrolled-courses',
//     icon: <FontAwesomeIcon icon={faGraduationCap} className="me-3" />,
//   },
//   {
//     component: CNavItem,
//     name: 'Courses',
//     to: '/courses',
//     icon: <FontAwesomeIcon icon={faShoppingCart} className="me-3" />,
//   },
// ];

// export default _nav;
