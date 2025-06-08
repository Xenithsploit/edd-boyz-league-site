import React from 'react';

const RestartMeter = ({ correctPredictions = 0, restartOpportunities = 0 }) => {
  const progress = Math.min((correctPredictions % 3) / 3 * 100, 100); // Reset after 3 correct

  return (
    <div className="max-w-md mx-auto text-center mt-8 p-6 bg-gray-900 text-white rounded-lg shadow-lg border border-red-600 relative overflow-visible">
      <h2 className="text-2xl font-extrabold text-yellow-400 mb-3">Restart Meter</h2>

      <div className="relative h-6 bg-gray-700 rounded-full group overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-black">
          {correctPredictions % 3} / 3
        </span>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-10">
          Earn a restart every 3 correct predictions!
        </div>
      </div>

      <p className="mt-4 text-lg">
        🔁 Available Restarts: <span className="text-yellow-300 font-semibold">{restartOpportunities}</span>
      </p>
    </div>
  );
};

export default RestartMeter;
