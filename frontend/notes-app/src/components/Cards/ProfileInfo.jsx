import React from 'react';
import PropTypes from 'prop-types';
import { genInitials } from '../../utils/helper';

const ProfileInfo = ({ userInfo, onLogout }) => {
  if (!userInfo) {
    return null; // or return a placeholder UI
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
        {genInitials(userInfo.fullName)}
      </div>
      <div>
        <p className='text-sm font-medium'>{userInfo.fullName}</p>
        <button
          className='text-sm text-slate-700 underline border-transparent p-1.3 m-1 rounded-lg shadow-lg'
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

ProfileInfo.propTypes = {
  userInfo: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default ProfileInfo;