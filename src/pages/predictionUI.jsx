// src/components/PredictionUI.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  where,
} from 'firebase/firestore';

const PredictionUI = () => {
  const { user } = useUser();
  const [matchups, setMatchups] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMatchups = async () => {
      try {
        const q = query(collection(db, 'matchups'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMatchups(data);
      } catch (error) {
        console.error('Failed to fetch matchups:', error);
      }
    };

    fetchMatchups();
  }, []);

  const handleSubmit = async () => {
    if (!selectedWinner || !user || !selectedMatchId) return;

    setSubmitting(true);
    try {
      const predictionsRef = collection(db, 'predictions');
      const q = query(
        predictionsRef,
        where('userId', '==', user.uid),
        where('matchId', '==', selectedMatchId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert('You have already submitted a prediction for this match.');
        setSubmitting(false);
        return;
      }

      await addDoc(predictionsRef, {
        matchId: selectedMatchId,
        userId: user.uid,
        predictedWinner: selectedWinner,
        actualWinner: '',
        result: 'pending',
        timestamp: serverTimestamp(),
      });

      setSuccessMessage('Prediction submitted successfully!');
      setSelectedWinner('');
      setSelectedMatchId('');
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Failed to submit prediction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-6 py-8 bg-black text-white rounded-lg shadow-lg border border-red-700">
      <h2 className="text-3xl font-extrabold text-center text-red-500 mb-6 drop-shadow">
        Weekly Match Predictions
      </h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-700 text-white rounded shadow">
          {successMessage}
        </div>
      )}

      {matchups.length === 0 ? (
        <p className="text-center text-gray-400">No matchups available yet.</p>
      ) : (
        <div className="space-y-6">
          {matchups.map(match => (
            <div
              key={match.id}
              className={`p-5 rounded-lg transition-all duration-200 border-2 ${
                selectedMatchId === match.matchId
                  ? 'border-red-500 shadow-red-500 shadow-md'
                  : 'border-gray-700'
              } bg-gradient-to-br from-gray-900 to-black`}
            >
              <p className="text-xl font-semibold text-center mb-4">
                {match.team1} <span className="text-red-500 font-bold">vs</span> {match.team2}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-transform duration-150 transform hover:scale-105 ${
                    selectedWinner === match.team1 && selectedMatchId === match.matchId
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedMatchId(match.matchId);
                    setSelectedWinner(match.team1);
                  }}
                >
                  {match.team1}
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-transform duration-150 transform hover:scale-105 ${
                    selectedWinner === match.team2 && selectedMatchId === match.matchId
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedMatchId(match.matchId);
                    setSelectedWinner(match.team2);
                  }}
                >
                  {match.team2}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedWinner || !selectedMatchId || submitting}
          className={`px-8 py-2 rounded-full font-bold text-black transition ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-400 shadow-md'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Prediction'}
        </button>
      </div>
    </div>
  );
};

export default PredictionUI;
