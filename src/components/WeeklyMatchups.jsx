import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const WeeklyMatchups = () => {
  const [matchups, setMatchups] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'matchups'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchups(fetched);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-3xl font-extrabold text-center text-yellow-400 drop-shadow mb-4">
        Weekly Matchups
      </h2>

      {matchups.length === 0 ? (
        <p className="text-center text-gray-400 italic">No matchups available yet.</p>
      ) : (
        matchups.map((matchup) => (
          <div
            key={matchup.id}
            className="bg-gray-900 text-white border border-red-600 rounded-lg p-4 mb-4 shadow-lg"
          >
            <p className="text-lg font-bold text-yellow-300 mb-1">Week {matchup.week}</p>
            <p className="text-xl">
              <span className="font-semibold text-white">{matchup.team1}</span> 
              <span className="mx-2 text-red-500 font-bold">vs</span>
              <span className="font-semibold text-white">{matchup.team2}</span>
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default WeeklyMatchups;
