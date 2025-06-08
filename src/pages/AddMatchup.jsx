// src/pages/AddMatchup.jsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const AddMatchup = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [matchId, setMatchId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user || user.role !== 'commissioner') {
    return (
      <div className="text-center mt-12 text-red-600 font-bold text-lg">
        ❌ Access Denied — Commissioners Only
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!team1 || !team2 || !matchId) {
      setError('All fields are required.');
      return;
    }

    try {
      await addDoc(collection(db, 'matchups'), {
        team1,
        team2,
        matchId,
        timestamp: serverTimestamp(),
      });

      setSuccess('✅ Matchup added successfully!');
      setTeam1('');
      setTeam2('');
      setMatchId('');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Error adding matchup:', err);
      setError('Failed to add matchup.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-gradient-to-br from-black to-red-900 text-white shadow-2xl rounded-2xl border border-red-700">
      <h2 className="text-3xl font-extrabold text-center text-red-400 mb-6 drop-shadow-lg">
        Add Weekly Matchup
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Player 1 (Team Name or User)"
          value={team1}
          onChange={(e) => setTeam1(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 border border-red-500 placeholder-red-300 text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
        />
        <input
          type="text"
          placeholder="Player 2 (Team Name or User)"
          value={team2}
          onChange={(e) => setTeam2(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 border border-red-500 placeholder-red-300 text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
        />
        <input
          type="text"
          placeholder="Unique Match ID"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 border border-red-500 placeholder-red-300 text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
        />

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-500 text-white py-3 font-bold rounded shadow-lg transition transform hover:scale-105"
        >
          Submit Matchup
        </button>
      </form>

      {error && <p className="text-red-400 mt-4 text-center font-semibold">{error}</p>}
      {success && <p className="text-green-400 mt-4 text-center font-semibold">{success}</p>}
    </div>
  );
};

export default AddMatchup;
