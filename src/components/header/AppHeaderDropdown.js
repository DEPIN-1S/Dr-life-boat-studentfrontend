import React, { useState, useEffect } from 'react';
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
} from '@coreui/react';
import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { useNavigate } from 'react-router-dom';

const API_BASE = API_BASE_URL;

const AppHeaderDropdown = () => {
  const [userName, setUserName] = useState('Loading...');
  const [userImage, setUserImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          setUserName('Guest');
          return;
        }

        const res = await fetch(`${API_BASE}/drlifeboat/student/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          const user = json.data;

          setUserName(user.s_name || 'Student');


          const fullImageUrl = user.s_profile_pic
            ? getImageUrl(user.s_profile_pic)
            : null;

          setUserImage(fullImageUrl);

          // Keep session name updated
          sessionStorage.setItem('name', user.s_name || 'Student');
        } else if (res.status === 401) {
          sessionStorage.clear();
          navigate('/login');
        }
      } catch (err) {
        console.error('Header profile load failed:', err);
        setUserName(sessionStorage.getItem('name') || 'Student');
      }
    };

    loadUser();
  }, [navigate]);


 
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div className="d-flex align-items-center">
          <div className="me-3 text-end">
            <div className="fw-semibold">{userName}</div>

          </div>
          <CAvatar
            src={userImage }
            size="md"
            className="shadow border border-2 border-white"
          />
        </div>
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem header className="fw-bold">
          {userName}
        </CDropdownItem>
        <CDropdownItem divider />

        <CDropdownItem
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          My Profile
        </CDropdownItem>

        {/* <CDropdownItem
          onClick={() => navigate('/forgot-password')}
          style={{ cursor: 'pointer' }}
        >
          Forgot Password
        </CDropdownItem> */}

        <CDropdownItem
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            navigate('/login');
          }}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
