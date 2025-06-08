import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

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

const TeamSelect = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logos, setLogos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().team) {
          setHasTeam(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadLogos = async () => {
      const loaded = {};
      for (const team of teams) {
        try {
          const url = await getDownloadURL(ref(storage, `team_logos/${team.slug}.png`));
          loaded[team.slug] = url;
        } catch {
          loaded[team.slug] = null;
        }
      }
      setLogos(loaded);
    };
    loadLogos();
  }, []);

  const handleSubmit = async () => {
    if (!currentUser || !selectedTeam) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      displayName: currentUser.displayName,
      team: selectedTeam,
    }, { merge: true });

    alert(`You have signed with ${selectedTeam.toUpperCase()}!`);
    navigate('/');
  };

  if (loading) return <div className="text-center mt-20 text-white">Loading...</div>;

  if (!currentUser) {
    return <div className="text-center mt-20 text-white text-xl">You must be logged in.</div>;
  }

  if (hasTeam) {
    return (
      <div className="text-center mt-20 text-white">
        <h2 className="text-2xl font-bold mb-2">You’ve already selected your team.</h2>
        <p>Contact the Commissioner if you need to switch.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">Select Your Team</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {teams.map((team) => (
          <div
            key={team.slug}
            onClick={() => setSelectedTeam(team.slug)}
            className={`cursor-pointer p-4 rounded-lg border transition duration-200 ${
              selectedTeam === team.slug
                ? 'border-yellow-400 bg-gray-900 scale-105'
                : 'border-gray-700 bg-gray-950'
            } hover:border-yellow-500 hover:shadow-lg`}
          >
            {logos[team.slug] ? (
              <img
                src={logos[team.slug]}
                alt={`${team.name} logo`}
                className="w-20 h-20 mx-auto mb-2 object-contain"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-2 bg-gray-700 rounded" />
            )}
            <h2 className="text-center font-semibold text-sm">{team.name}</h2>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={!selectedTeam}
          className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition disabled:opacity-50"
        >
          Confirm Team Selection
        </button>
      </div>
    </div>
  );
};

export default TeamSelect;
