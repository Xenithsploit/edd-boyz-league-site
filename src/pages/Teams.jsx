// src/pages/Teams.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

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

const Teams = () => {
  const [logos, setLogos] = useState({});

  useEffect(() => {
    const fetchLogos = async () => {
      const newLogos = {};
      for (const team of teams) {
        try {
          const url = await getDownloadURL(ref(storage, `team_logos/${team.slug}.png`));
          newLogos[team.slug] = url;
        } catch {
          newLogos[team.slug] = null;
        }
      }
      setLogos(newLogos);
    };

    fetchLogos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-center text-red-600 mb-8 drop-shadow">
        Explore the EDD Boyz Teams
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {teams.map((team) => (
          <Link
            key={team.slug}
            to={`/teams/${team.slug}`}
            className="bg-gray-950 text-white rounded-lg p-4 border border-red-700 hover:border-yellow-400 hover:shadow-lg transition transform hover:scale-105"
          >
            {logos[team.slug] ? (
              <img
                src={logos[team.slug]}
                alt={`${team.name} Logo`}
                className="w-20 h-20 mx-auto mb-2 object-contain"
              />
            ) : (
              <div className="w-20 h-20 mx-auto mb-2 bg-gray-700 rounded" />
            )}
            <h2 className="text-center font-semibold text-sm">{team.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Teams;
