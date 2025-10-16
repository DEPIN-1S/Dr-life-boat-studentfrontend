import React from 'react'
import { CAvatar, CDropdown, CDropdownToggle } from '@coreui/react'
import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const userName = sessionStorage.getItem('name')
  // const userId = 'STD 121145'

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0 d-flex align-items-center"
        caret={false}
      >
        <div className="me-2 text-end">{/* <div className="small text-muted">Hi,</div> */}</div>
        <div className="fw-semibold">
          {userName}
          <br />
          <span className="text-muted" style={{ fontSize: '0.8em' }}>
            {' '}
            {/* {userId} */}
          </span>
        </div>

        {/* <CAvatar src={avatar8} size="md" /> */}
      </CDropdownToggle>
    </CDropdown>
  )
}

export default AppHeaderDropdown
