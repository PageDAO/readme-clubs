import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';

const mockUser: User = {
  name: 'John Doe',
  profileImage: 'https://via.placeholder.com/150',
  bookshelfCount: 3,
  clubsJoined: 5,
  slug: 'john-doe',
};

const ProfileView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4">
        ← Back
      </button>
      <div className="text-center">
        <img
          src={mockUser.profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto"
        />
        <h1 className="text-2xl font-bold mt-4">{mockUser.name}</h1>
        <p>Bookshelves: {mockUser.bookshelfCount}</p>
        <p>Clubs Joined: {mockUser.clubsJoined}</p>
      </div>
    </div>
  );
};

export default ProfileView;