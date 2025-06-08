// src/pages/CommissionerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const teams = [
  { name: 'Auburn Tigers', slug: 'auburn' },
  { name: 'Florida Gators', slug: 'florida' },
  { name: 'Florida State Seminoles', slug: 'floridastate' },
  { name: 'Houston Cougars', slug: 'houston' },
  { name: 'LSU Tigers', slug: 'lsu' },
  { name: 'Miami Hurricanes', slug: 'miami' },
  { name: 'North Carolina Tarheels', slug: 'northcarolina' },
  { name: 'Notre Dame Fighting Irish', slug: 'notredame' },
  { name: 'Ole Miss Rebels', slug: 'olemiss' },
  { name: 'Oregon Ducks', slug: 'oregon' },
  { name: 'Penn State Nittany Lions', slug: 'pennstate' },
  { name: 'South Carolina Gamecocks', slug: 'southcarolina' },
  { name: 'Texas Tech Red Raiders', slug: 'texastech' },
  { name: 'UCLA Bruins', slug: 'ucla' },
  { name: 'Washington Huskies', slug: 'washington' },
];

const CommissionerDashboard = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTeamChange = async (userId, selectedSlug) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { team: selectedSlug });
    alert(`✅ Updated team for ${userId} to ${selectedSlug}`);
    fetchUsers();
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-4xl font-extrabold text-center text-red-500 mb-10 drop-shadow-lg">
        🧠 Commissioner Dashboard
      </h1>

      {users.map((user) => (
        <div
          key={user.id}
          className="bg-gray-900 border border-red-600 rounded-xl p-6 mb-6 shadow-2xl text-white"
        >
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {user.displayName || user.username}
          </h2>
          <p className="mb-2 text-sm text-gray-300">
            🏈 Current Team: <span className="font-semibold text-white">{user.team || 'None selected'}</span>
          </p>

          <div className="mb-4">
            <label className="mr-3 text-sm font-medium text-red-300">Change Team:</label>
            <select
              value={user.team || ''}
              onChange={(e) => handleTeamChange(user.id, e.target.value)}
              className="bg-gray-800 border border-red-500 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <option value="">-- Select a Team --</option>
              {teams.map((team) => (
                <option key={team.slug} value={team.slug}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p className="bg-gray-800 rounded-lg px-4 py-2 shadow-inner">
              ✅ Correct Predictions: <span className="font-bold text-green-400">{user.correctPredictions || 0}</span> / 3
            </p>
            <p className="bg-gray-800 rounded-lg px-4 py-2 shadow-inner">
              🔁 Restart Opportunities: <span className="font-bold text-yellow-400">{user.restartOpportunities || 0}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommissionerDashboard;
