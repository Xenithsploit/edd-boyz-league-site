import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../contexts/UserContext';

const RestartButton = () => {
  const { user } = useUser();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestart = async () => {
    if (!user || user.restartOpportunities < 1) {
      setStatus('❌ No restarts available.');
      return;
    }

    setLoading(true);
    try {
      const newCount = user.restartOpportunities - 1;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        restartOpportunities: newCount,
      });

      setStatus(`✅ Restart used! You now have ${newCount} left.`);
    } catch (error) {
      console.error('Error using restart:', error);
      setStatus('❌ Error processing restart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center my-6">
      <button
        onClick={handleRestart}
        disabled={!user || user.restartOpportunities < 1 || loading}
        className="bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-red-500 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Use Restart'}
      </button>
      {status && (
        <p className="mt-3 text-sm text-yellow-400 font-medium">{status}</p>
      )}
    </div>
  );
};

export default RestartButton;
