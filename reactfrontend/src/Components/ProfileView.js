import React from 'react';

const ProfileView = ({ profile }) => {
    return (
        <div>
            <h2>Profile</h2>
            <p>Username: {profile.username}</p>
            <p>Email: {profile.email}</p>
            {/* Add any other profile details you want to display */}
        </div>
    );
};

export default ProfileView;
