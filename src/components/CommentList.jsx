import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

const CommentList = ({ postId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetched);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleVote = async (commentId, type) => {
    if (!user) return;

    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (!snap.exists()) return;

    const comment = snap.data();
    const currentVote = comment.voters?.[user.uid] || null;

    if (currentVote === type) return; // Already voted this way

    let likeChange = 0;
    let dislikeChange = 0;

    if (type === 'like') {
      likeChange = 1;
      if (currentVote === 'dislike') dislikeChange = -1;
    } else if (type === 'dislike') {
      dislikeChange = 1;
      if (currentVote === 'like') likeChange = -1;
    }

    await updateDoc(commentRef, {
      likes: (comment.likes || 0) + likeChange,
      dislikes: (comment.dislikes || 0) + dislikeChange,
      voters: {
        ...(comment.voters || {}),
        [user.uid]: type,
      },
    });
  };

  return (
    <div className="mt-2 space-y-3">
      {comments.length === 0 ? (
        <p className="text-gray-500 italic">No comments yet.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="bg-gray-900 p-3 rounded text-white shadow-md">
            <div className="flex items-center space-x-2 mb-1">
              {comment.profilePic && (
                <img src={comment.profilePic} alt="profile" className="w-6 h-6 rounded-full" />
              )}
              <span className="font-semibold">{comment.author}</span>
              <span className="text-xs text-gray-400">
                {comment.timestamp?.toDate?.().toLocaleString?.() || ''}
              </span>
            </div>
            <p className="mb-2">{comment.text}</p>

            <div className="flex space-x-4 text-sm text-gray-400">
              <button
                onClick={() => handleVote(comment.id, 'like')}
                className={`hover:text-green-400 transition ${
                  comment.voters?.[user?.uid] === 'like' ? 'font-bold text-green-500' : ''
                }`}
              >
                👍 {comment.likes || 0}
              </button>
              <button
                onClick={() => handleVote(comment.id, 'dislike')}
                className={`hover:text-red-400 transition ${
                  comment.voters?.[user?.uid] === 'dislike' ? 'font-bold text-red-500' : ''
                }`}
              >
                👎 {comment.dislikes || 0}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
