// src/pages/SubmitVOD.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

const VODUpload = () => {
  const { user } = useUser();
  const [vodUrl, setVodUrl] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!vodUrl || !platform) {
      alert('Please fill out all fields!');
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'vods'), {
        url: vodUrl,
        platform,
        submittedBy: user?.displayName || user?.email || 'Unknown',
        approved: false,
        timestamp: serverTimestamp()
      });
      alert('VOD submitted for review!');
      setVodUrl('');
      setPlatform('YouTube');
    } catch (err) {
      console.error('Error uploading VOD:', err);
      alert('Failed to submit VOD.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-gradient-to-br from-black to-gray-900 border border-red-600 rounded-xl shadow-lg text-white">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-red-500 drop-shadow">
        Submit a VOD
      </h1>

      <input
        type="text"
        value={vodUrl}
        onChange={(e) => setVodUrl(e.target.value)}
        placeholder="Enter video link"
        className="w-full px-4 py-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
      />

      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        className="w-full px-4 py-2 mb-4 rounded bg-gray-800 border border-gray-700 text-white"
      >
        <option value="YouTube">YouTube</option>
        <option value="Twitch">Twitch</option>
        <option value="TikTok">TikTok</option>
        <option value="Other">Other</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded shadow transition"
      >
        {submitting ? 'Submitting...' : 'Submit for Approval'}
      </button>
    </div>
  );
};

export default VODUpload;
