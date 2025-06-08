// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUser } from '../contexts/UserContext';

const Profile = () => {
  const { user, loading } = useUser();
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!username) {
      alert('Username cannot be empty!');
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { username });
      alert('Username updated!');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!profilePic) {
      alert('Please select a file to upload!');
      return;
    }

    const fileRef = ref(storage, `profile_pics/${user.uid}`);
    await uploadBytes(fileRef, profilePic);
    const url = await getDownloadURL(fileRef);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { profilePic: url });

    alert('Profile picture updated!');
  };

  if (loading) return <div className="text-center mt-12 text-gray-400">Loading Profile...</div>;
  if (!user) return <div className="text-center mt-12 text-gray-400">Please log in to view your profile.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl shadow-lg bg-gradient-to-br from-black to-gray-900 border border-red-600 text-white">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-red-500 drop-shadow">
        Your Profile
      </h1>

      {user.profilePic && (
        <div className="flex justify-center mb-4">
          <img
            src={user.profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-red-600 shadow-md"
          />
        </div>
      )}

      <p className="text-center text-lg mb-6">
        <strong>Team:</strong>{' '}
        <span className="text-red-400">{user.team || 'None assigned'}</span>
      </p>

      <div className="space-y-6">
        {/* Username Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white w-full md:w-2/3"
            placeholder="Enter new username"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            {saving ? 'Saving...' : 'Save Username'}
          </button>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <input
            type="file"
            onChange={(e) => setProfilePic(e.target.files[0])}
            className="text-white"
          />
          <button
            onClick={handleUpload}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Upload Profile Picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
