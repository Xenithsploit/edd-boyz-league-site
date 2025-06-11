// src/pages/AdminUpdateResults.jsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const AdminUpdateResults = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [matchups, setMatchups] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'commissioner') {
      navigate('/');
    }

    const fetchMatchups = async () => {
      const q = query(collection(db, 'matchups'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatchups(data);
    };

    fetchMatchups();
  }, [user, navigate]);

  const handleUpdate = async () => {
    if (!selectedMatchId || !selectedWinner) return;

    try {
      const predictionsRef = collection(db, 'predictions');
      const q = query(predictionsRef, where('matchId', '==', selectedMatchId));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.forEach(docSnap => {
        const isCorrect = docSnap.data().predictedWinner === selectedWinner;
        batch.update(doc(db, 'predictions', docSnap.id), {
          actualWinner: selectedWinner,
          result: isCorrect ? 'correct' : 'incorrect',
        });
      });

      await batch.commit();
      setStatus('Prediction results successfully updated.');
      setSelectedMatchId('');
      setSelectedWinner('');
    } catch (error) {
      console.error('Failed to update results:', error);
      setStatus('An error occurred while updating.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-black text-white p-6 rounded-lg border border-red-700 shadow-xl">
      <h1 className="text-3xl font-extrabold text-red-500 mb-6 text-center">
        Admin: Update Match Results
      </h1>

      {status && (
        <div className="mb-4 p-3 rounded text-center font-medium bg-yellow-600 text-black shadow">
          {status}
        </div>
      )}

      <div className="space-y-6">
        {matchups.map(match => (
          <div
            key={match.id}
            className={`p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border-2 ${
              selectedMatchId === match.id ? 'border-red-500' : 'border-gray-700'
            }`}
          >
            <p className="text-lg font-semibold mb-3 text-center">
              {match.week}: {match.team1} <span className="text-red-500">vs</span> {match.team2}
            </p>
            <div className="flex justify-center gap-4">
              {[match.team1, match.team2].map(team => (
                <button
                  key={team}
                  onClick={() => {
                    setSelectedMatchId(match.id);
                    setSelectedWinner(team);
                  }}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 transform hover:scale-105 ${
                    selectedWinner === team && selectedMatchId === match.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleUpdate}
          disabled={!selectedMatchId || !selectedWinner}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Confirm Result
        </button>
      </div>
    </div>
  );
};

export default AdminUpdateResults;
