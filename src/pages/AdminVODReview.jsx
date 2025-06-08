// src/pages/AdminVODReview.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

const AdminVODReview = () => {
  const { user } = useUser();
  const [pendingVODs, setPendingVODs] = useState([]);
  const isCommissioner = user?.role === 'commissioner';

  useEffect(() => {
    const fetchPendingVODs = async () => {
      const q = query(collection(db, 'vods'), where('approved', '!=', true));
      const snapshot = await getDocs(q);
      const vodList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingVODs(vodList);
    };

    if (isCommissioner) {
      fetchPendingVODs();
    }
  }, [isCommissioner]);

  const handleApproval = async (id, approved) => {
    await updateDoc(doc(db, 'vods', id), {
      approved,
    });
    setPendingVODs((prev) => prev.filter((vod) => vod.id !== id));
  };

  if (!isCommissioner) {
    return (
      <div className="text-center mt-12 text-red-600 font-bold text-lg">
        ❌ Access Denied — Commissioners Only
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-br from-black to-red-900 text-white shadow-2xl rounded-2xl border border-red-700">
      <h1 className="text-3xl font-extrabold text-red-400 text-center mb-8 drop-shadow">
        Pending VOD Approvals
      </h1>

      {pendingVODs.length === 0 ? (
        <p className="text-center text-gray-400 italic">No pending VODs at the moment.</p>
      ) : (
        pendingVODs.map((vod) => (
          <div
            key={vod.id}
            className="mb-6 p-5 rounded-lg bg-gray-900 border border-red-600 shadow-inner"
          >
            <h2 className="text-xl font-bold text-white mb-1">{vod.title || 'Untitled VOD'}</h2>
            <p className="text-sm text-gray-300 mb-2">Submitted by: {vod.author || 'Unknown'}</p>
            <a
              href={vod.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 underline hover:text-red-300 transition"
            >
              ▶️ View VOD
            </a>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleApproval(vod.id, true)}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold shadow-md transition transform hover:scale-105"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleApproval(vod.id, false)}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold shadow-md transition transform hover:scale-105"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminVODReview;
