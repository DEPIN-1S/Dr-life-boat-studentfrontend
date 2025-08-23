import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'

// Import the logo correctly
import logo from '../../src/assets/images/logo.svg'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <>
      {/* Custom styles */}
      <style>
        {`
          .custom-sidebar .nav-link {
            color: #000 !important;
            transition: background-color 0.3s, color 0.3s;
          }

          .custom-sidebar .nav-link i,
          .custom-sidebar .nav-link svg {
            color: #099089 !important;
            transition: color 0.3s;
          }

          .custom-sidebar .nav-link:hover,
          .custom-sidebar .nav-link:focus,
          .custom-sidebar .nav-link.active {
            background-color: #099089 !important;
            color: #fff !important;
          }

          .custom-sidebar .nav-link:hover i,
          .custom-sidebar .nav-link:hover svg,
          .custom-sidebar .nav-link:focus i,
          .custom-sidebar .nav-link:focus svg,
          .custom-sidebar .nav-link.active i,
          .custom-sidebar .nav-link.active svg {
            color: #fff !important;
          }
        `}
      </style>

      <CSidebar
        className="border-end custom-sidebar"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch({ type: 'set', sidebarShow: visible })
        }}
        style={{ backgroundColor: '#ffffff' }}
      >
        <CSidebarHeader className="border-bottom" style={{ backgroundColor: '#ffffff' }}>
          <CSidebarBrand to="/">
            {/* <img
              src={logo}
              alt="Logo"
              height="40"
              className="sidebar-logo"
              style={{
                width: '200px',
                height: '50px',
                objectFit: 'cover',
              }}
            /> */}
          </CSidebarBrand>
          <CCloseButton
            className="d-lg-none"
            dark
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          />
        </CSidebarHeader>

        <AppSidebarNav items={navigation} />

        <CSidebarFooter
          className="border-top d-none d-lg-flex"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* <CSidebarToggler
            onClick={() =>
              dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })
            }
          /> */}
        </CSidebarFooter>
      </CSidebar>
    </>
  )
}

export default React.memo(AppSidebar)
