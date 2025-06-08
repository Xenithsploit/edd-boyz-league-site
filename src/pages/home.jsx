// src/pages/Home.jsx
import React from "react";
import RestartMeter from "../components/RestartMeter";
import RestartButton from "../components/RestartButton";
import { useUser } from "../contexts/UserContext";
import WeeklyMatchups from "../components/WeeklyMatchups";

const Home = () => {
  const { user } = useUser();

  return (
    <div className="text-center mt-12 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-red-500 drop-shadow-lg mb-4">
        🔥 EDD Boyz League Network
      </h1>

      <p className="text-lg text-gray-200 mb-8 bg-gray-900 px-4 py-3 rounded-lg shadow-lg">
        Home of the most electrifying Dynasty in sports gaming.
      </p>

      <div className="bg-black border-2 border-red-600 rounded-2xl p-6 shadow-2xl mb-10">
        <h2 className="text-2xl text-white font-semibold mb-2">
          Welcome, <span className="text-red-400">{user?.username || user?.displayName || 'Coach'}</span>
        </h2>

        <p className="text-sm text-gray-400 mb-4">Stay locked in, scout your opponents, and earn that restart.</p>

        <div className="my-6">
          <RestartMeter
            correctPredictions={user?.correctPredictions}
            restartOpportunities={user?.restartOpportunities}
          />
        </div>

        <RestartButton />
      </div>

      <div className="bg-gray-900 border border-red-700 p-6 rounded-xl shadow-xl">
        <h3 className="text-xl text-red-400 font-bold mb-4">🏆 Weekly Matchups</h3>
        <WeeklyMatchups />
      </div>
    </div>
  );
};

export default Home;
